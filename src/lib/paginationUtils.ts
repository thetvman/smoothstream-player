
import { Channel, PaginatedChannels, Movie, PaginatedMovies, Series, PaginatedSeries } from "./types";

export const ITEMS_PER_PAGE = 12; // Changed from 50 to 12 channels per page

/**
 * Paginate an array of channels
 */
export const paginateChannels = (
  channels: Channel[],
  page: number = 1,
  itemsPerPage: number = ITEMS_PER_PAGE
): PaginatedChannels => {
  const totalItems = channels.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  
  return {
    items: channels.slice(startIndex, endIndex),
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage
  };
};

/**
 * Paginate an array of series
 */
export const paginateSeries = (
  series: Series[],
  page: number = 1,
  itemsPerPage: number = ITEMS_PER_PAGE
): PaginatedSeries => {
  const totalItems = series.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  
  return {
    items: series.slice(startIndex, endIndex),
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage
  };
};

/**
 * Generic function to paginate any array of items
 */
export const paginateItems = <T>(
  items: T[],
  page: number = 1,
  itemsPerPage: number = ITEMS_PER_PAGE
): {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
} => {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  
  return {
    items: items.slice(startIndex, endIndex),
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage
  };
};
