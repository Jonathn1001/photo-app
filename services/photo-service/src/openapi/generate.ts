import './register.js';
import { writeOpenApiJson } from '@photo-app/shared/openapi';
writeOpenApiJson('./openapi.json', 'photo-service', '1.0.0');
