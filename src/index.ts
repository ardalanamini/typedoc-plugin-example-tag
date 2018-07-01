import * as plugin from "./plugin";

export = (pluginHost: any) => {
  const app = pluginHost.owner;

  app.options.addDeclaration({ name: "preferred-example-language" });

  app.converter.addComponent("example-tag", plugin.ExampleTagPlugin);
};
