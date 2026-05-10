import './register.js';
import { writeOpenApiJson } from '@photo-app/shared/openapi';
writeOpenApiJson('./openapi.json', 'user-service', '1.0.0');
