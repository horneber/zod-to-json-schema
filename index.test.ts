import * as z from 'zod';
import { JSONSchema7 } from 'json-schema';
import { toJsonSchema } from '.';
describe('Parsing a given object', () => {
  it('should return a proper json schema with some common types without validation', () => {
    const zodSchema = z.object({
      requiredString: z.string(),
      optionalString: z.string().optional(),
      literalString: z.literal('literalStringValue'),
      stringArray: z.array(z.string()),
      stringEnum: z.enum(['stringEnumOptionA', 'stringEnumOptionB']),
      tuple: z.tuple([z.string(), z.number(), z.boolean()]),
      record: z.record(z.boolean()),
      requiredNumber: z.number(),
      optionalNumber: z.number().optional(),
      numberOrNull: z.number().nullable(),
      numberUnion: z.union([z.literal(1), z.literal(2), z.literal(3)]),
      mixedUnion: z.union([z.literal('abc'), z.literal(123), z.object({ nowItGetsAnnoying: z.literal(true) })]),
    });
    const expectedJsonSchema: JSONSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $ref: '#/definitions/zodSchema',
      definitions: {
        zodSchema: {
          type: 'object',
          properties: {
            requiredString: {
              type: 'string',
            },
            optionalString: {
              type: 'string',
            },
            literalString: {
              type: 'string',
              const: 'literalStringValue',
            },
            stringArray: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            stringEnum: {
              type: 'string',
              enum: ['stringEnumOptionA', 'stringEnumOptionB'],
            },
            tuple: {
              type: 'array',
              minItems: 3,
              items: [
                {
                  type: 'string',
                },
                {
                  type: 'number',
                },
                {
                  type: 'boolean',
                },
              ],
              maxItems: 3,
            },
            record: {
              type: 'object',
              additionalProperties: {
                type: 'boolean',
              },
            },
            requiredNumber: {
              type: 'number',
            },
            optionalNumber: {
              type: 'number',
            },
            numberOrNull: {
              type: ['number', 'null'],
            },
            numberUnion: {
              type: 'number',
              enum: [1, 2, 3],
            },
            mixedUnion: {
              anyOf: [
                {
                  type: 'string',
                  const: 'abc',
                },
                {
                  type: 'number',
                  const: 123,
                },
                {
                  type: 'object',
                  properties: {
                    nowItGetsAnnoying: {
                      type: 'boolean',
                      const: true,
                    },
                  },
                  required: ['nowItGetsAnnoying'],
                  additionalProperties: false,
                },
              ],
            },
          },
          required: [
            'requiredString',
            'literalString',
            'stringArray',
            'stringEnum',
            'tuple',
            'record',
            'requiredNumber',
            'numberOrNull',
            'numberUnion',
            'mixedUnion',
          ],
          additionalProperties: false,
        },
      },
    };
    const parsedSchema = toJsonSchema({ zodSchema });
    expect(parsedSchema).toStrictEqual(expectedJsonSchema);
  });
  it('should handle recurring properties with paths', () => {
    const addressSchema = z.object({ street: z.string(), number: z.number(), city: z.string() });
    const someAddresses = z.object({
      address1: addressSchema,
      address2: addressSchema,
      lotsOfAddresses: z.array(addressSchema),
    });
    const jsonSchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $ref: '#/definitions/someAddresses',
      definitions: {
        someAddresses: {
          type: 'object',
          properties: {
            address1: {
              type: 'object',
              properties: { street: { type: 'string' }, number: { type: 'number' }, city: { type: 'string' } },
              additionalProperties: false,
              required: ['street', 'number', 'city'],
            },
            address2: { $ref: '#/definitions/someAddresses/properties/address1' },
            lotsOfAddresses: { type: 'array', items: { $ref: '#/definitions/someAddresses/properties/address1' } },
          },
          additionalProperties: false,
          required: ['address1', 'address2', 'lotsOfAddresses'],
        },
      },
    };
    const parsedSchema = toJsonSchema({ someAddresses });
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
});
