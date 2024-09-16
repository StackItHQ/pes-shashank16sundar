function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const editedRow = e.range.getRow();
  const editedColumn = e.range.getColumn();

  const LAST_MODIFIED_COLUMN = 5;

  if (editedColumn === LAST_MODIFIED_COLUMN) {
    return;
  }

  const currentTimestamp = getFormattedTimestamp();
  sheet.getRange(editedRow, LAST_MODIFIED_COLUMN).setValue(currentTimestamp);
}

function getFormattedTimestamp() {
  const date = new Date();
  // Format the date as 'YYYY-MM-DD HH:MM:SS'
  return Utilities.formatDate(date, "UTC", "yyyy-MM-dd HH:mm:ss");
}
