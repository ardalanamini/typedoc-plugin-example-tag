import { Application, Context, Converter, ParameterType, ReflectionKind } from "typedoc";

export function load(app: Application) {
  app.options.addDeclaration({
    type: ParameterType.String,
    name: "preferred-example-language",
    help: "[Example Tag Plugin] Specifies the preferred example tag language.",
    defaultValue: "typescript",
  });

  app.converter.on(Converter.EVENT_RESOLVE_BEGIN, (context: Context) => {
    const preferredLanguage = app.options.getValue("preferred-example-language");

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

        comment.text += `#### Example\n\`\`\`${preferredLanguage}${comment.tags[index].text}\`\`\``;
        comment.tags.splice(index);

        continue;
      }

      let counter = 0;

      for (const index of indexes) {
        comment.text += `#### Example ${++counter}\n\`\`\`${preferredLanguage}${comment.tags ? comment.tags[index].text : ""}\`\`\``;

        if (counter !== length) comment.text += "\n";
      }

      indexes.reverse().forEach((index) => comment.tags.splice(index));
    }
  });
}
