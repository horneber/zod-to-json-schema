import { ZodSchema } from "zod";

export type Targets = "jsonSchema7" | "jsonSchema2019-09" | "openApi3"

export type Options<Target extends Targets = "jsonSchema7"> =
  {
    name: string | undefined;
    $refStrategy: "root" | "relative" | "none";
    basePath: string[];
    effectStrategy: "input" | "any";
    pipeStrategy: "input" | "all";
    target: Target;
    strictUnions: boolean;
    definitionPath: string;
    definitions: Record<string, ZodSchema>;
    errorMessages: boolean;
  };

export const defaultOptions: Options = {
  name: undefined,
  $refStrategy: "root",
  basePath: ["#"],
  effectStrategy: "input",
  pipeStrategy: "all",
  definitionPath: "definitions",
  target: "jsonSchema7",
  strictUnions: false,
  definitions: {},
  errorMessages: false,
};

export const getDefaultOptions = <Target extends Targets>(
  options: Partial<Options<Target>> | string | undefined
) =>
  (typeof options === "string"
    ? {
        ...defaultOptions,
        name: options,
      }
    : {
        ...defaultOptions,
        ...options,
      }) as Options<Target>;
