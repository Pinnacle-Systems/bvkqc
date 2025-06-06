import * as styleSheetService from '../services/style.service.js';
import { NoRecordFound } from '../configs/Responses.js';

const transformCountry = (countryField) => {
  if (countryField && typeof countryField === 'object') {
    return countryField.value;
  }
  return countryField;
};

const transformBody = (body) => {
  const { 
    basicInfo, 
    capacityLeadTimes, 
    developmentDetails, 
    constructionDetails, 
    processFinishing, 
    testPerformance, 
    productionDetails 
  } = body;

  return {
    fdsDate: basicInfo?.fdsDate ? new Date(basicInfo.fdsDate) : null,
    fabCode: basicInfo?.fabCode,
    fabType: basicInfo?.fabType,
    countryOriginFabric: transformCountry(basicInfo?.countryOriginFabric),
    countryOriginYarn: transformCountry(basicInfo?.countryOriginYarn),
    countryOriginFiber: transformCountry(basicInfo?.countryOriginFiber),
    smsMcq: capacityLeadTimes?.smsMcq,
    smsMoq: capacityLeadTimes?.smsMoq,
    smsLeadTime: capacityLeadTimes?.smsLeadTime,
    bulkMcq: capacityLeadTimes?.bulkMcq,
    bulkMoq: capacityLeadTimes?.bulkMoq,
    bulkLeadTime: capacityLeadTimes?.bulkLeadTime,

    surCharges: developmentDetails?.surCharges,
    priceFob: developmentDetails?.priceFob,
    fabricImage: developmentDetails?.fabricImage,
    construction: constructionDetails?.construction,
    fiberContent: constructionDetails?.fiberContent,
    yarnDetails: constructionDetails?.yarnDetails,
    weightGSM: constructionDetails?.weightGSM,
    weftWalesCount: constructionDetails?.weftWalesCount,
    widthFinished: constructionDetails?.widthFinished,
    widthCuttale: constructionDetails?.widthCuttale,
    wrapCoursesCount: constructionDetails?.wrapCoursesCount,
    dyedMethod: processFinishing?.dyedMethod,
    printingMethod: processFinishing?.printingMethod,
    surfaceFinish: processFinishing?.surfaceFinish,
    otherPerformanceFunction: processFinishing?.otherPerformanceFunction,
   testName: testPerformance?.testName,
    testResult: testPerformance?.testResult,
    testStandard: testPerformance?.testStandard,
    additionalTests: testPerformance?.additionalTests,
    careInstructions: testPerformance?.careInstructions,
    qualityLimitations: testPerformance?.qualityLimitations,
    reportData: productionDetails?.reportData,
    supportingDocs: productionDetails?.supportingDocs,
  };
};

export const create = async (req, res) => {
  try {
    const transformedData = transformBody(req.body);
    const newStyleSheet = await styleSheetService.createStyleSheet(transformedData);
    res.status(201).json({ statusCode: 0, data: newStyleSheet });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const transformedData = transformBody(req.body);
    const updatedStyleSheet = await styleSheetService.updateStyleSheet(id, transformedData);
    res.status(200).json({ statusCode: 0, data: updatedStyleSheet });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const styleSheet = await styleSheetService.getStyleSheetById(id);
    
    if (!styleSheet) {
      return NoRecordFound("StyleSheet", res);
    }
    
    res.status(200).json({ statusCode: 0, data: styleSheet });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const get = async (req, res) => {
  try {
    const styleSheets = await styleSheetService.getAllStyleSheets();
    res.status(200).json({ statusCode: 0, data: styleSheets });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const styleSheet = await styleSheetService.getStyleSheetById(id);
    
    if (!styleSheet) {
      return NoRecordFound("StyleSheet", res);
    }
    
    await styleSheetService.deleteStyleSheet(id);
    res.status(200).json({ statusCode: 0, message: "StyleSheet deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
