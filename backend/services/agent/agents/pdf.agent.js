// import { getModel } from "../config/llmModel.js"
// import { generatePdf } from "../utils/generatePdf.js"
// import { getFromS3 } from "../utils/getFromS3.js"
// import { uploadToS3 } from "../utils/uploadToS3.js"

// export const pdfAgent = async (state) => {
//     console.log("pdf agent")
//     try {
//         const llm = await getModel("pdf")
//                 const prompt = `
//                 You are an expert document writer.

//         Return ONLY valid JSON.

//         Do NOT return markdown.

//         Do NOT return explanations.

//         Structure:

//         {

//         "title":"",
//         "subtitle":"",
//         "sections":[
//         {
//         "heading":"",
//         "points":[]

//         }
//         ]
//         }

//         Generate 4-8 sections
//         Each section should have 3-6 concise bullet points
//         Topic ${state.prompt}

//                 `





//         const res = await llm.invoke(prompt)
//         // console.log(JSON.parse(res.content))
//         const data = JSON.parse(res.content)
//         const pdfBuffer = await generatePdf(data)

//         // AWS S3
//         const filename = `pdf-${Date.now()}.pdf`
//         await uploadToS3(filename, pdfBuffer, "application/pdf")
//         const downloadUrl = await getFromS3(filename, 24 * 60)

//         return {
//             ...state,
//             // aiResponse:`# PDF Generated
//             // **${data.title}**
//             // 📥 [Download PDF](${downloadUrl})
//             // _Link expires in 10 minutes
//             // `
//             aiResponse: [
//                 "# 📄 PDF Generated Successfully",
//                 "",
//                 `**${data.title}**`,
//                 "",
//                 `📥 [Download PDF](${downloadUrl})`,
//                 "",
//                 "⌛ Link expires in 10 minutes."
//             ].join("\n")


//         }


//     } catch (error) {
//         console.log(error)
//         return {
//             ...state,
//             aiResponse: "Failed to generate PDF"
//         }

//     }

// }





import { checkAgentLimits } from "../config/agentLimit.js";
import { getModel } from "../config/llmModel.js";
import { deductCredits } from "../utils/deductcredits.js";
import { generatePdf } from "../utils/generatePdf.js";
import { getFromS3 } from "../utils/getFromS3.js";
import { uploadToS3 } from "../utils/uploadToS3.js";

export const pdfAgent = async (state) => {
  console.log("PDF agent");

  try {
    await checkAgentLimits(state.userId, "pdf")

    const topic = String(state.prompt || "").trim();

    if (!topic) {
      throw new Error("PDF topic is missing");
    }

    const llm = await getModel("pdf");

    const prompt = `
You are an expert educational document writer.

Create a detailed, useful document about this exact topic:
${topic}

Requirements:
- Use the exact requested topic.
- Generate 4-8 relevant sections.
- Each section must contain 3-6 informative points.
- Include explanations, examples, and practical details.
- For programming topics, include relevant code examples.
- Avoid generic filler and repeated points.
- Do not write about an unrelated topic.
- Return ONLY valid JSON, without Markdown fences.

Required structure:
{
  "title": "Specific document title",
  "subtitle": "Document description",
  "sections": [
    {
      "heading": "Section heading",
      "points": [
        "Detailed explanation",
        "Relevant example",
        "Practical application"
      ]
    }
  ]
}
`;

    const res = await llm.invoke(prompt);

    let content =
      typeof res.content === "string"
        ? res.content
        : Array.isArray(res.content)
          ? res.content
              .filter((item) => item.type === "text")
              .map((item) => item.text)
              .join("\n")
          : "";

    // Handle models that wrap JSON in Markdown fences
    content = content
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "");

    const data = JSON.parse(content);

    if (
      !data.title ||
      !Array.isArray(data.sections) ||
      data.sections.length === 0
    ) {
      throw new Error("Invalid PDF content returned by the model");
    }

    for (const section of data.sections) {
      if (
        typeof section.heading !== "string" ||
        !Array.isArray(section.points)
      ) {
        throw new Error("Invalid PDF section structure");
      }
    }


     // deduct user credits
    await deductCredits(state.userId, "pdf")

    const pdfBuffer = await generatePdf(data);

    if (!Buffer.isBuffer(pdfBuffer) || pdfBuffer.length === 0) {
      throw new Error("PDF generation returned an empty file");
    }

    const filename = `pdf-${Date.now()}.pdf`;

    await uploadToS3(
      filename,
      pdfBuffer,
      "application/pdf"
    );

    
    const expiresIn = 24*60;
    const downloadUrl = await getFromS3(filename, expiresIn);

    if (!downloadUrl) {
      throw new Error("Failed to generate PDF download URL");
    }

    return {
      ...state,
      aiResponse: [
        "# 📄 PDF Generated Successfully",
        "",
        `**${data.title}**`,
        "",
        `[Download PDF](${downloadUrl})`,
        "",
        "⌛ Link expires in 10 minutes.",
      ].join("\n"),
    };
  } catch (error) {

    console.error("PDF generation failed:", error);
    
      return {
        ...state,
        aiResponse:error?.data?.message || "failed to generate pdf"
      }
    
  }
};
