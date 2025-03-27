
import { Channel, PaginatedChannels } from "./types";

export const ITEMS_PER_PAGE = 50;

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
