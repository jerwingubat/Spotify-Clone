import { onRequest } from 'firebase-functions/v2/https'
import { createApi } from './api.js'
import { createBackend } from './backend.js'

const api = createApi(createBackend())

export const apiHandler = onRequest({ region: 'us-central1' }, api.handle)