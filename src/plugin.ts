import { Component, ConverterComponent } from "typedoc/dist/lib/converter/components";
import { Context } from "typedoc/dist/lib/converter/context";
import { Converter } from "typedoc/dist/lib/converter/converter";
import { Options } from "typedoc/dist/lib/utils/options";

@Component({ name: "example-tag" })
export class ExampleTagPlugin extends ConverterComponent {
  private _prefLang = "typescript";

  initialize() {
    this.listenTo(this.owner, {
      [Converter.EVENT_BEGIN]: this.onBegin,
      [Converter.EVENT_RESOLVE_BEGIN]: this.onBeginResolve,
    });
  }

  onBegin() {
    const options: Options = this.application.options;

    const prefLang = options.getValue("preferred-example-language");
    if (prefLang) this._prefLang = prefLang;
  }

  onBeginResolve(context: Context) {
    const reflections = context.project.reflections;

    for (const key in reflections) {
      const comment = reflections[key].comment;

      if (!comment || !comment.tags) continue;

      const indexes: number[] = [];
      comment.tags.forEach((tag, index) => {
        if (tag.tagName !== "example") return;

        indexes.push(index);
      });

      const length = indexes.length;

      if (length === 1) {
        const index = indexes[0];

        comment.text += `#### Example\n\`\`\`${this._prefLang}${comment.tags[index].text}\`\`\``;
        comment.tags.splice(index);

        continue;
      }

      let counter = 0;
      indexes.reverse().forEach((index) => {
        comment.text += `#### Example ${++counter}\n\`\`\`${this._prefLang}${comment.tags[index].text}\`\`\``;
        if (counter !== length)
          comment.text += `\n`;
        comment.tags.splice(index);
      });
    }
  }
}
