/**
 * Parse page/limit from query. Set hasPage when client sends `page`.
 */
function parsePagination(query, { defaultLimit = 20, maxLimit = 100 } = {}) {
  const hasPage = query.page !== undefined && query.page !== '';
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const skip = (page - 1) * limit;
  return { hasPage, page, limit, skip };
}

function sendList(res, { data, total, page, limit, hasPage }) {
  if (hasPage) {
    return res.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  }
  return res.json({ success: true, data });
}

module.exports = { parsePagination, sendList };
