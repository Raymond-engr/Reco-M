import axios from 'axios';
import logger from '../../utils/logger.js';
import { ExternalServiceAPIError } from '../../utils/customErrors.js';

export function handleExternalServiceError(serviceName: string, error: any): never {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      if (error.response.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        logger.error(`${serviceName} API rate limit reached`);
        throw new ExternalServiceAPIError(`${serviceName} API Rate Limit Exceeded`, 429, { retryAfter });
      }
      logger.error(`${serviceName} API error:`, error.response.data);
      throw new ExternalServiceAPIError(
        `${serviceName} API Error ${error.response?.status}`,
        error.response?.status,
        error.response?.data
      );
    } else if (error.request) {
      logger.error(`${serviceName} API Request Error`, error.request);
      throw new ExternalServiceAPIError(`${serviceName} API Request Error`, 0, error.request);
    } else {
      logger.error(`${serviceName} API Error`, error.message);
      throw new ExternalServiceAPIError(`${serviceName} API Error`, 0, error.message);
    }
  }
  logger.error(`Unexpected error in ${serviceName} API:`, error);
  throw new ExternalServiceAPIError(`Error in ${serviceName} API call`, 500, error);
}