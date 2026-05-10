import { OpenAPIRegistry, OpenApiGeneratorV31, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { z } from 'zod';
extendZodWithOpenApi(z);

export const apiRegistry = new OpenAPIRegistry();

export function buildOpenApiDocument(opts: { title: string; version: string; servers?: { url: string }[] }): OpenAPIObject {
  const generator = new OpenApiGeneratorV31(apiRegistry.definitions);
  return generator.generateDocument({
    openapi: '3.1.0',
    info: { title: opts.title, version: opts.version },
    servers: opts.servers ?? [{ url: 'http://localhost' }],
  });
}
