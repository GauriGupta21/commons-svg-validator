export function generateSanitizationReport(

  original: string,

  sanitized: string

) {

  const report = {

    removedScripts: false,

    removedForeignObjects: false,

    removedMetadata: false,

    originalSize:
      Buffer.byteLength(original),

    sanitizedSize:
      Buffer.byteLength(sanitized),

    reductionPercent: 0

  };

  // script removal

  if (
    original.includes("<script")
    &&
    !sanitized.includes("<script")
  ) {

    report.removedScripts = true;

  }

  // foreignObject removal

  if (
    original.includes("<foreignObject")
    &&
    !sanitized.includes("<foreignObject")
  ) {

    report.removedForeignObjects = true;

  }

  // metadata removal

  if (
    original.includes("<metadata")
    &&
    !sanitized.includes("<metadata")
  ) {

    report.removedMetadata = true;

  }

  // reduction

  report.reductionPercent =
    Math.round(

      (
        (
          report.originalSize
          -
          report.sanitizedSize
        )

        /

        report.originalSize
      )

      * 100

    );

  return report;

}