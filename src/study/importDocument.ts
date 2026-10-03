const maxFileBytes = 10 * 1024 * 1024;
export const maxTextLength = 500_000;

export function validateText(text: string): string {
  const cleaned = text.replace(/\u0000/g, "").trim();
  if (!cleaned) throw new Error("Không tìm thấy văn bản. Với tài liệu scan hoặc ảnh, hãy dán phần chữ đã nhận dạng.");
  if (cleaned.length > maxTextLength) throw new Error("Nội dung vượt quá 500.000 ký tự. Hãy chia thành tài liệu nhỏ hơn.");
  return cleaned;
}

export async function importDocument(file: File): Promise<string> {
  if (file.size > maxFileBytes) throw new Error("Tệp vượt quá 10 MB. Hãy chọn tệp nhỏ hơn.");
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (["txt", "md", "csv", "tsv"].includes(extension || "")) return validateText(await file.text());
  if (extension === "docx") {
    const mammoth = await import("mammoth/mammoth.browser");
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return validateText(result.value);
  }
  if (extension === "pdf") {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = "/study-worker/pdf.worker.min.mjs";
    const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
    try {
      const pdf = await task.promise;
      if (pdf.numPages > 300) throw new Error("PDF vượt quá 300 trang. Hãy chia nhỏ tài liệu trước khi thêm.");
      const pages: string[] = [];
      let length = 0;
      for (let number = 1; number <= pdf.numPages; number++) {
        const page = await pdf.getPage(number);
        const content = await page.getTextContent();
        const text = content.items.map(item => "str" in item ? `${item.str}${item.hasEOL ? "\n" : " "}` : "").join("");
        pages.push(text);
        length += text.length;
        if (length > maxTextLength) throw new Error("Nội dung vượt quá 500.000 ký tự. Hãy chia nhỏ tài liệu.");
      }
      return validateText(pages.join("\n\n"));
    } finally { await task.destroy(); }
  }
  throw new Error("Hỗ trợ PDF có văn bản, DOCX, TXT, Markdown, CSV và TSV. Với ảnh, âm thanh hoặc video, hãy dán văn bản/bản chép lời.");
}
