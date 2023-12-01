const moment = require('moment');

const validateParams = (req, res, next) => {
  const { start_date, end_date, quarter, report_type } = req.params;

  if (!['cf', 'ic', 'bs'].includes(report_type)) {
    // console.log('Invalid report_type.', report_type);
    return res.status(400).json({
      error: 'Invalid report_type. Allowed values are cf, ic, bs.',
    });
  }

  const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateFormat.test(start_date) || !dateFormat.test(end_date)) {
    return res
      .status(400)
      .send('Invalid date format. Please use yyyy-mm-dd.');
  }

  // Check if end_date is not earlier than start_date
  if (moment(end_date).isBefore(moment(start_date))) {
    return res
      .status(400)
      .send('end_date cannot be earlier than start_date.');
  }

  // Check if end_date is in the future
  if (moment(end_date).isAfter(moment())) {
    return res.status(400).send('end_date cannot be in the future.');
  }

  if (!['0', '1', '2', '3', '4'].includes(quarter)) {
    return res
      .status(400)
      .send('Invalid quarter. It must be 0, 1, 2, 3, or 4.');
  }

  console.log('Params validated.', start_date, end_date, quarter);
  next();
};

module.exports = validateParams;
