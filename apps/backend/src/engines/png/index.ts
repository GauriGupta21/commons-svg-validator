export async function processPNG(
  buffer: Buffer
) {

  const issues = [];

  if (
    buffer.length >
    15 * 1024 * 1024
  ) {

    issues.push({
      severity: "warning",
      message:
        "Large PNG files may be inefficient on Commons"
    });
  }

  return {

    type: "png",

    originalSize:
      buffer.length,

    validation: {

      valid: true,

      issues
    }
  };

}