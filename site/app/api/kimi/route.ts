import { NextResponse } from "next/server";

export const runtime = "edge";

type KimiChoice = { message?: { content?: string } };

const palettes = ["orange", "blue", "green", "rose", "sand", "violet"];
const forms = ["fold", "cylinder", "arch", "module", "sphere"];
const outputTypes = ["concept_sketch", "3d_render", "complex_render", "campaign_poster"];

function getApiKey() {
  return process.env.MOONSHOT_API_KEY || process.env.OPENAI_API_KEY;
}

async function callKimi(body: Record<string, unknown>) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Kimi API 密钥尚未配置");
  let lastError = "Kimi 服务暂时不可用";
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch("https://api.moonshot.cn/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "kimi-k3", reasoning_effort: "high", ...body }),
        signal: AbortSignal.timeout(135000),
      });
      const data = await response.json() as { choices?: KimiChoice[]; error?: { message?: string } };
      if (!response.ok) {
        lastError = data.error?.message || `Kimi 请求失败（${response.status}）`;
        const retryable = response.status === 429 || response.status >= 500 || /photo.*overload|overload.*photo|overloaded/i.test(lastError);
        if (retryable && attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 900));
          continue;
        }
        throw new Error(lastError);
      }
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("Kimi 未返回有效内容");
      return JSON.parse(content) as Record<string, unknown>;
    } catch (error) {
      lastError = error instanceof Error ? error.message : lastError;
      if (attempt === 0 && /fetch|network|timeout|aborted/i.test(lastError)) {
        await new Promise((resolve) => setTimeout(resolve, 900));
        continue;
      }
      break;
    }
  }
  if (/photo.*overload|overload.*photo|overloaded/i.test(lastError)) throw new Error("参考图服务当前繁忙，图片已优化压缩，请稍后再次生成");
  throw new Error(lastError);
}

export async function POST(request: Request) {
  try {
    const input = await request.json() as {
      mode?: "refine" | "create" | "export";
      prompt?: string;
      features?: string[];
      references?: string[];
      renderMode?: "auto" | "concept_sketch" | "3d_render" | "complex_render" | "campaign_poster";
      project?: Record<string, unknown>;
      copy?: string;
      styleReferences?: string[];
    };

    if (input.mode === "refine") {
      if (!input.prompt?.trim()) return NextResponse.json({ error: "请先输入一个初步想法" }, { status: 400 });
      const content: Array<Record<string, unknown>> = [
        {
          type: "text",
          text: `请理解并优化下面的设计想法。保留用户原始意图，不凭空改变产品类别；补充目标用户、使用场景、核心功能、形态、材质、交互和视觉氛围中真正有帮助的信息。若有参考图，只提炼可迁移的形态、材质、配色和构图特征。最终 optimizedPrompt 必须是一段可直接用于后续视觉方案生成的完整中文描述，控制在 120–600 个中文字符，不要使用 markdown，也不要解释优化过程。

原始想法：${input.prompt.slice(0, 1200)}
已有特征：${(input.features || []).slice(0, 10).join("、") || "无"}
预期输出类型：${input.renderMode || "auto"}`,
        },
      ];
      for (const url of (input.references || []).filter((item) => item.startsWith("data:image/") && item.length <= 5_500_000).slice(0, 1)) {
        content.unshift({ type: "image_url", image_url: { url } });
      }
      const result = await callKimi({
        messages: [
          { role: "system", content: "你是资深产品设计策略师，擅长把零散想法补全为准确、具体、可执行的创作描述。禁止模板化套话，禁止改变用户核心诉求。" },
          { role: "user", content },
        ],
        max_completion_tokens: 3200,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "sketchflow_refined_prompt",
            strict: true,
            schema: {
              type: "object",
              properties: {
                optimizedPrompt: { type: "string" },
                addedDetails: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 6 },
              },
              required: ["optimizedPrompt", "addedDetails"],
              additionalProperties: false,
            },
          },
        },
      });
      return NextResponse.json(result);
    }

    if (input.mode === "create") {
      if (!input.prompt?.trim()) return NextResponse.json({ error: "请输入设计需求" }, { status: 400 });
      const content: Array<Record<string, unknown>> = [
        {
          type: "text",
          text: `你是兼具工业设计、视觉设计、3D 艺术指导和品牌传播经验的创意总监。请先完整理解需求，再决定视觉输出，不要急于套用简单造型。

分析顺序：
1. 明确目标用户、使用场景、核心任务、功能约束、情绪与品牌气质；
2. 分别分析参考板中每张图的形态语言、比例、材质、色彩、光线、构图和可迁移元素，避免照抄；
3. 将需求与参考图综合成 3–4 条互不重复、可以落地的设计方向；
4. 输出模式为“${input.renderMode || "auto"}”。auto 时根据用户措辞智能选择：早期形态探索用 concept_sketch；需要真实材质和产品展示用 3d_render；包含环境、人物或空间叙事用 complex_render；强调传播、标题和品牌视觉用 campaign_poster；
5. 生成的视觉参数必须充分描述主体、材质、场景、灯光和画面重点，达到可交付给 3D/视觉设计师继续制作的程度。

用户需求：${input.prompt.slice(0, 1800)}
用户指定特征：${(input.features || []).slice(0, 10).join("、") || "无"}

只分析参考图片本身，不识别或复述图片中的文字。不要输出空泛词语。`,
        },
      ];
      for (const url of (input.references || []).filter((item) => item.startsWith("data:image/") && item.length <= 5_500_000).slice(0, 1)) {
        content.unshift({ type: "image_url", image_url: { url } });
      }
      const result = await callKimi({
        messages: [{ role: "system", content: "你负责把模糊想法转化为专业、完整、具体、可执行的视觉设计方案。优先忠实理解用户意图与参考图关系，保留关键约束，禁止模板化套话和 markdown。" }, { role: "user", content }],
        max_completion_tokens: 6500,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "sketchflow_concept",
            strict: true,
            schema: {
              type: "object",
              properties: {
                understanding: { type: "string" },
                directions: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 4 },
                tags: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 6 },
                referenceInsights: { type: "array", items: { type: "string" }, minItems: 0, maxItems: 4 },
                concept: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    caption: { type: "string" },
                    form: { type: "string", enum: forms },
                    palette: { type: "string", enum: palettes },
                    outputType: { type: "string", enum: outputTypes },
                    material: { type: "string" },
                    scene: { type: "string" },
                    lighting: { type: "string" },
                  },
                  required: ["title", "caption", "form", "palette", "outputType", "material", "scene", "lighting"],
                  additionalProperties: false,
                },
              },
              required: ["understanding", "directions", "tags", "referenceInsights", "concept"],
              additionalProperties: false,
            },
          },
        },
      });
      return NextResponse.json(result);
    }

    if (input.mode === "export") {
      if (!input.project || !input.copy?.trim()) return NextResponse.json({ error: "请选择项目并输入设计文案" }, { status: 400 });
      const result = await callKimi({
        messages: [
          { role: "system", content: "你是资深设计提案编辑。生成可直接制作成简洁 PPT 的中文内容。每页信息克制，禁止 markdown。" },
          { role: "user", content: `项目资料：${JSON.stringify(input.project).slice(0, 7000)}\n设计文案：${input.copy.slice(0, 1800)}\n风格参考：${(input.styleReferences || []).slice(0, 6).join("、") || "无"}` },
        ],
        max_completion_tokens: 6000,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "sketchflow_deck",
            strict: true,
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                subtitle: { type: "string" },
                slides: {
                  type: "array",
                  minItems: 4,
                  maxItems: 7,
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      body: { type: "string" },
                      bullets: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
                    },
                    required: ["title", "body", "bullets"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["title", "subtitle", "slides"],
              additionalProperties: false,
            },
          },
        },
      });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "不支持的生成模式" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "生成失败" }, { status: 500 });
  }
}
