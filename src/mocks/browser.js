// src/mocks/browser.js
import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser'; // Import from 'msw/browser'
import { handlers } from './handlers';

// Create the worker with the handlers
export const worker = setupWorker(...handlers);