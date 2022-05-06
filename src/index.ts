import { Application, Context, Converter, ParameterType, ReflectionKind } from "typedoc";

export function load(app: Application) {
  app.options.addDeclaration({
    type: ParameterType.String,
    name: "preferred-example-language",
    help: "[Example Tag Plugin] Specifies the preferred example tag language.",
    defaultValue: "typescript",
  });

  app.converter.on(Converter.EVENT_RESOLVE_BEGIN, (context: Context) => {
    const preferredLanguage = app.options.getValue("preferred-example-language") as string;

    const reflections = context.project.getReflectionsByKind(ReflectionKind.All);

    for (const reflection of reflections) {
      const comment = reflection.comment;

      if (comment?.tags == null) continue;

      const indexes = comment.tags.reduce<number[]>((prev, tag, index) => {
        if (tag.tagName === "example") prev.push(index);

        return prev;
      }, []);

      const length = indexes.length;

      if (length === 1) {
        const index = indexes[0];

        comment.text += prepareExample(preferredLanguage, comment.tags[index].text);
        comment.tags.splice(index, 1);

        continue;
      }

      let counter = 0;

      for (const index of indexes) {
        comment.text += prepareExample(preferredLanguage, comment.tags[index].text, ++counter);

        if (counter !== length) comment.text += "\n";
      }

      indexes.reverse().forEach((index) => comment.tags.splice(index, 1));
    }
  });
}

function prepareExample(preferredLanguage: string, example: string, counter?: number): string {
  if (!example.startsWith("\n")) example = `\n${example}`;

  if (!example.endsWith("\n")) example += "\n";

  return `#### Example${counter == null ? "" : ` ${counter}`}\n\`\`\`${preferredLanguage}${example}\`\`\``;
}
