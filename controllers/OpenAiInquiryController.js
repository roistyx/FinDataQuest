StockDao = require('../models/StockNewsDao');

const { Configuration, OpenAIApi } = require('openai');
const { format, parseISO, isExists } = require('date-fns');

class OpenAiInquiryController {
  static async SummarizeOpenAi(req, res) {
    // console.log("Summarizing article content...");

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    try {
      const openai = new OpenAIApi(configuration);
      console.log('Summarizing article content...');

      const response = await openai.createChatCompletion({
        model: 'gpt-4-1106-preview',
        messages: [
          {
            role: 'user',
            content:
              'summarize to 8th reader level: ' + req.body.content,
          },
        ],
      });
      // console.log(response.data.choices[0].message.content);
      req.body.content = response.data.choices[0].message.content;

      return res.status(200).json(req.body);
    } catch (error) {
      console.error('OpenAI Error:', error.message);
    }
  }

  static async ChatBotOpenAi(req, res) {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    try {
      const openai = new OpenAIApi(configuration);
      const userQuestion = req.body.inputValue;
      console.log('Chatting with OpenAI...', userQuestion);
      const response = await openai.createChatCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content:
              'Respond to this question at an 8th-grade reading level. Include examples if they help to clarify the information.: ' +
              userQuestion,
          },
        ],
      });
      console.log(response.data.choices[0].message.content);
      const chatGBTAnswer = response.data.choices[0].message.content;

      return res.status(200).json(chatGBTAnswer);
    } catch (error) {
      console.error('OpenAI Error:', error.message);
    }
  }
  static async GenerateFinancialStatement(req, res, quarter) {
    console.log('Open AI', quarter);
    const reportType = req.params.report_type; // bs, ic, cf

    const { symbol } = req.params;
    const statement = req.requestedFinancialReport.report[reportType];
    if (!statement) {
      console.log('No statement found for', reportType);
      return res.status(200).json({
        message: 'No data found for this symbol.',
      });
    }
    const { name: companyName } = req.symbolSearchResult;

    const { startDate, endDate, form } = req.requestedFinancialReport;
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });

    try {
      const formattedStartDate = format(
        parseISO(startDate),
        'MMMM d, yyyy'
      );
      const formattedEndDate = format(
        parseISO(endDate),
        'MMMM d, yyyy'
      );
      switch (reportType) {
        case 'bs':
          req.reportName = 'Balance Sheet';
          break;
        case 'ic':
          req.reportName = 'Income Statement';
          break;
        case 'cf':
          req.reportName = 'Cash Flow Statement';
          break;
        default:
        // Handle default case or error
      }

      const openai = new OpenAIApi(configuration);

      let transformedStatement = statement
        .map((item) => `${item.label}: ${item.value}`)
        .join(', ');

      // const response = await openai.createChatCompletion({
      //   model: 'gpt-4-1106-preview',
      //   messages: [
      //     {
      //       role: 'user',
      //       // content: `Create and display ${companyName}'s ${req.reportName} in a tabular format, utilizing the provided data, while adhering to Generally Accepted Accounting Principles (GAAP): ${transformedStatement}`,
      //       content: `Generate and showcase ${companyName}'s ${
      //         quarter == 0 ? 'annual' : quarter + 'Q'
      //       } ${
      //         req.reportName
      //       } in US Dollars for the period starting ${formattedStartDate}, through ${formattedEndDate}. Present the information in a structured table format using the provided data and ensure compliance with Generally Accepted Accounting Principles (GAAP): ${transformedStatement}`,
      //     },
      //   ],
      // });

      // console.log(
      //   'report:',
      //   response.data.choices[0].message.content
      // );
      // return response.data.choices[0].message.content;

      return transformedStatement;
    } catch (error) {
      console.error('OpenAI Error:', error.message);
      return res
        .status(500)
        .json({ error: 'Error getting ' + req.reportName });
    }
  }
}

module.exports = OpenAiInquiryController;
