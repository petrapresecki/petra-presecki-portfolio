// Renders each page of the CV PDF to a JPEG, so the site can show the real pages as a sheet of paper.
//   swift scripts/cv-pages.swift public/Petra-Presecki-CV.pdf public/cv
import AppKit
import PDFKit

let args = CommandLine.arguments
guard args.count == 3, let doc = PDFDocument(url: URL(fileURLWithPath: args[1])) else {
  print("usage: swift scripts/cv-pages.swift <cv.pdf> <out dir>"); exit(1)
}
let out = URL(fileURLWithPath: args[2])
try FileManager.default.createDirectory(at: out, withIntermediateDirectories: true)
let scale: CGFloat = 2.6 // about 1550 px wide, sharp on a retina screen at full size

for i in 0..<doc.pageCount {
  guard let page = doc.page(at: i) else { continue }
  let box = page.bounds(for: .mediaBox)
  let w = Int(box.width * scale), h = Int(box.height * scale)
  guard let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: w, pixelsHigh: h, bitsPerSample: 8, samplesPerPixel: 4,
                                   hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0),
        let ctx = NSGraphicsContext(bitmapImageRep: rep) else { continue }
  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = ctx
  ctx.cgContext.setFillColor(NSColor.white.cgColor)
  ctx.cgContext.fill(CGRect(x: 0, y: 0, width: w, height: h))
  ctx.cgContext.scaleBy(x: scale, y: scale)
  page.draw(with: .mediaBox, to: ctx.cgContext)
  NSGraphicsContext.restoreGraphicsState()
  let file = out.appendingPathComponent("page-\(i + 1).jpg")
  try rep.representation(using: .jpeg, properties: [.compressionFactor: 0.86])!.write(to: file)
  print("\(file.path) · \(w)×\(h)")
}
