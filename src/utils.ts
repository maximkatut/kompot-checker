import prettier from "prettier";

export async function formatCode(rawCode: string): Promise<string> {
  return await prettier.format(rawCode, {
    parser: "babel",
    semi: true,
    singleQuote: true,
  });
}
