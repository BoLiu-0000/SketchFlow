import { NextResponse } from "next/server";

export const runtime = "edge";

type KimiChoice = { message?: { content?: string } };

const palettes = ["orange", "blue", "green", "rose", "sand", "violet"];
const forms = ["fold", "cylinder", "arch", "module", "sphere"];

function getApiKey() {
  return process.env.MOONSHOT_API_KEY || process.env.OPENAI_API_KEY;
}

async function callKimi(body: Record<string, unknown>) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Kimi API 密钥尚未配置");
  const response = await fetch("https://api.moonshot.cn/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "kimi-k3", reasoning_effort: "high", ...body }),
  });
  const data = await response.json() as { choices?: KimiChoice[]; error?: { message?: string } };
  if (!response.ok) throw new Error(data.error?.message || "Kimi 服务暂时不可用");
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Kimi 未返回有效内容");
  return JSON.parse(content) as Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    const input = await request.json() as {
      mode?: "create" | "export";
      prompt?: string;
      features?: string[];
      references?: string[];
      project?: Record<string, unknown>;
      copy?: string;
      styleReferences?: string[];
    };

    if (input.mode === "create") {
      if (!input.prompt?.trim()) return NextResponse.json({ error: "请输入设计需求" }, { status: 400 });
      const content: Array<Record<string, unknown>> = [
        {
          type: "text",
          text: `你是工业设计总监。根据需求、特征和参考图片，形成清晰可执行的设计理解与一张概念草图参数。只分析参考图的形态、材质、配色和构图，不识别或复述图片中的文字。\n需求：${input.prompt.slice(0, 1200)}\n特征：${(input.features || []).slice(0, 8).join("、") || "无"}`,
        },
      ];
      for (const url of (input.references || []).filter((item) => item.startsWith("data:image/")).slice(0, 3)) {
        content.unshift({ type: "image_url", image_url: { url } });
      }
      const result = await callKimi({
        messages: [{ role: "system", content: "输出简洁、专业、具体的工业设计判断。不要输出 markdown。" }, { role: "user", content }],
        max_completion_tokens: 4096,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "sketchflow_concept",
            strict: true,
            schema: {
              type: "object",
              properties: {
                understanding: { type: "string" },
                directions: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 3 },
                tags: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
                concept: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    caption: { type: "string" },
                    form: { type: "string", enum: forms },
                    palette: { type: "string", enum: palettes },
                  },
                  required: ["title", "caption", "form", "palette"],
                  additionalProperties: false,
                },
              },
              required: ["understanding", "directions", "tags", "concept"],
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
