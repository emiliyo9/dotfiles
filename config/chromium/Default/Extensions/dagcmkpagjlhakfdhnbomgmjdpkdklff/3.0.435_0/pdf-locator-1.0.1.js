/**
 * Helper module for logging.
 */

/**
 * Helper class for logging information.
 */
class LogHelper {
  /**
   * Helper method to log debug data
   *
   * @param {Object} msg
   * @param {Object} data
   */
  static logDebug(msg, data) {
    if (LogHelper._isLoggingEnabled()) {
      if (data) {
        console.log(msg, data);
      } else {
        console.log(msg);
      }
    }
  }

  /**
   * Helper function to check if logging is enabled
   */
  static _isLoggingEnabled() {
    return sessionStorage.getItem('pdfLocatorLogging') === 'true';
  }
}

/**
 * Helper function to enable logging
 */
function enablePdfLocatorLogging() {
  sessionStorage.setItem('pdfLocatorLogging', 'true');
}
/**
 * Module for holding the PDF Locator configuration
 */

/**
 * Class to hold all configurations
 */
class ConfigUtil {
  /**
   * Getter method to get all the configurations
   *
   * @param {Object} requestData
   */
  static getConfig(requestData) {
    var config = {
      doiBaseUrl: 'http://dx.doi.org/',
    };
    config.options = {
      retryCount: Number.parseInt(requestData.options.retryCount) || 2,
      connectionTimeout: Number.parseInt(requestData.options.connectionTimeout) || 60000,
      maxTotalConnections: Number.parseInt(requestData.options.maxTotalConnections) || 15,
      maxConnectionsPerHost: Number.parseInt(requestData.options.maxConnectionsPerHost) || 2,
    };
    return config;
  }
}
/**
 * Utility module for PDF Locator.
 */

/**
 * Class for holding different utility functions
 */
class PDFLocatorUtil {
  /**
   * Utility function to get domain from a URL. If protocol is false, it will just retrun hostname.
   *
   * @param {String} url
   * @param {Boolean} protocol
   */
  static getDomainUrl(url, protocol = true) {
    var domainUrl = '';
    if (typeof url !== 'undefined' && url !== '' && url.indexOf('://') > -1) {
      domainUrl = url
        .split('/')
        .slice(0, 3)
        .join('/');
    }
    if (!protocol) {
      return domainUrl.split('//')[1];
    }
    return domainUrl;
  }

  /**
   * Utility function to check if the url has hostname (i.e, absolute)
   *
   * @param {String} url
   */
  static isAbsoluteUrl(url) {
    return typeof url !== 'undefined' && url !== '' && url.indexOf('://') > -1;
  }

  /**
   * Utility function to form the url with hostname (i.e, absolute)
   *
   * @param {String} relativePath
   * @param {String} hostUrl
   */
  static getAbsoluteUrl(relativePath, hostUrl) {
    var resultUrl = '';
    if (!PDFLocatorUtil.isAbsoluteUrl(relativePath)) {
      if (relativePath.trim()[0] === '/') {
        resultUrl = PDFLocatorUtil.getDomainUrl(hostUrl) + relativePath;
      } else {
        resultUrl = PDFLocatorUtil.getDomainUrl(hostUrl) + '/' + relativePath;
      }
    } else {
      resultUrl = relativePath || '';
    }
    return resultUrl;
  }

  /**
   * Utility function to create a html document object from html string.
   *
   * @param {String} htmlString
   */
  static getHTMLDoc(htmlString) {
    var htmlDoc;
    try {
      let parser = new DOMParser();
      htmlDoc = parser.parseFromString(htmlString, 'text/html');
    } catch (ex) {
      htmlDoc = document.createElement('html');
      el.innerHTML = htmlString;
    }

    return htmlDoc;
  }

  /**
   * Utility function to check if a string ends with an input term
   *
   * @param {String} inpString
   * @param {String} text
   */
  static endsWith(inpString, text) {
    if (!(inpString && text)) {
      return false;
    }
    return inpString.toLowerCase().endsWith(text.toLowerCase());
  }

  /**
   * Utility function to check if a text exist in an input string.
   *
   * @param {String} inpString
   * @param {String} text
   */
  static containsText(inpString, text) {
    if (!(inpString && text)) {
      return false;
    }
    return inpString.toLowerCase().includes(text.toLowerCase());
  }
}
/**
 * Module for all HTTP connections
 */

/**
 * Http Runner class for all http connections.
 *
 * This always executes the requests asynchronously.
 */
class HTTPRunner {
  /**
   * Method to execute http request.
   *
   * @param {*} requestDetails
   */
  static execute(requestDetails) {
    HTTPRunner._http_retry(requestDetails, requestDetails.retryCount, 1, requestDetails.timeout, requestDetails.success, requestDetails.error);
  }

  /**
   * Private helper method for preparing http headers
   *
   * @param {*} xhttp
   * @param {*} headers
   */
  static _prepareHeaders(xhttp, headers) {
    for (var [key, value] of Object.entries(headers)) {
      xhttp.setRequestHeader(key, value);
    }
  }

  /**
   * Private helper method for http calls. This method will be called recursively.
   *
   * @param {*} requestDetails
   * @param {*} retry
   * @param {*} iterCount
   * @param {*} timeout
   * @param {*} successFunc
   * @param {*} errorFunc
   */
  static _http_retry(requestDetails, retry, iterCount, timeout, successFunc, errorFunc) {
    var xhttp = new XMLHttpRequest();
    var methodName = requestDetails.method;
    xhttp.open(methodName, requestDetails.url, true);
    HTTPRunner._prepareHeaders(xhttp, requestDetails.headers || {});
    xhttp.timeout = timeout;
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4) {
        var resp = {
          status: xhttp.status,
          statusText: xhttp.statusText,
          content: xhttp.response,
          contentType: xhttp.getResponseHeader('Content-Type'),
          headers: xhttp.getAllResponseHeaders(),
          triedCount: iterCount,
          responseURL: xhttp.responseURL,
        };
        if (xhttp.status === 200) {
          successFunc(resp);
        } else {
          if (retry === 1) {
            errorFunc(resp);
            return;
          }
          return HTTPRunner._http_retry(requestDetails, retry - 1, iterCount + 1, timeout, successFunc, errorFunc);
        }
      }
    };

    if (methodName !== 'GET' && methodName !== 'HEAD') {
      xhttp.send(requestDetails.body ? JSON.stringify(requestDetails.body) : '');
    } else {
      xhttp.send();
    }
  }
}
/**
 * Module as a service layer for all http connections.
 */

/**
 * Http Client class for all http requests.
 *
 */
class HTTPClient {
  /**
   * Method to get the HTML or PDF content of a URL.
   *
   * @param {Object} config
   * @param {Object} request
   * @param {String} origin
   */
  static getContent(config, request, origin) {
    HTTPClient._httpRequest(request.url, request.options, 'GET', function(resp) {
      var httpResponse = {
        content: resp.content,
        contentType: resp.contentType,
        headers: resp.headers,
        responseURL: resp.responseURL,
        statusCode: resp.status,
        method: 'GET',
      };

      HTTPClient.sendResponse(config, request, httpResponse, origin);
    });
  }

  /**
   * Method to check if the PDF can be downloaded.
   *
   * Makes a head call based on the input URL and determines if the response content
   * type is "application/pdf" and returns the Boolean.
   *
   * @param {Object} config
   * @param {Object} request
   * @param {String} origin
   */
  static checkPdfDownload(config, request, origin) {
    HTTPClient._checkPdfDownloadRetry(config, request, request.options.httpMethods || ['HEAD'], origin);
  }

  /**
   * Private recursive method to check if the PDF can be downloaded.
   *
   * @param {Object} config
   * @param {Object} request
   * @param {Array} httpMethods
   * @param {String} origin
   */
  static _checkPdfDownloadRetry(config, request, httpMethods, origin) {
    var methodName = httpMethods.shift();

    HTTPClient._httpRequest(request.url, request.options, methodName, function(resp) {
      if (!resp.success && httpMethods.length) {
        HTTPClient._checkPdfDownloadRetry(config, request, httpMethods, origin);
      }
      var httpResponse = {
        content: '',
        contentType: resp.contentType,
        headers: resp.headers,
        responseURL: resp.responseURL,
        statusCode: resp.status,
        method: methodName,
      };
      HTTPClient.sendResponse(config, request, httpResponse, origin);
    });
  }

  /**
   * Private helper method to send response to the caller based on the origin
   *
   * @param {Object} config
   * @param {Object} request
   * @param {Object} httpResponse
   * @param {String} origin
   */
  static sendResponse(config, request, httpResponse, origin) {
    try {
      if (origin === EntitlementChecker.name) {
        EntitlementChecker.handleHttpClientResponse(config, request, httpResponse);
      } else if (origin === ParsingStrategyManager.name) {
        ParsingStrategyManager.handleHttpClientResponse(config, request, httpResponse);
      } else if (origin === PDFLocator.name) {
        PDFLocator.handleHttpClientResponse(config, request, httpResponse);
      }
    } catch (err) {
      PDFLocator.dispatchErrorResponse(request, {}, err.message);
    }
  }

  /**
   * Helper method to make http request.
   *
   * @param url
   * @param options
   * @param httpMethod
   */
  static _httpRequest(url, options, httpMethod, callback) {
    var response = {};
    httpMethod = httpMethod || 'GET';
    var req = {
      method: httpMethod,
      url: url,
      success: function(httpResponse) {
        response = httpResponse;
        response.success = true;
        callback(response);
      },
      error: function(httpResponse) {
        response = httpResponse;
        response.success = false;
        callback(response);
      },
    };
    if (options.retryCount) {
      req.retryCount = options.retryCount;
    }
    if (options.connectionTimeout) {
      req.timeout = options.connectionTimeout;
    }
    HTTPRunner.execute(req);

    return response;
  }
}
/**
 * Module as a service layer for using all browser extension components and capabilities.
 */

/**
 * Client class for all browser extension interactions.
 *
 */
class BrowserClient {
  /**
   * Method to download the document based on the input URL.
   *
   * Downloads the document based on the input URL using the browser’s download API.
   * Once download is submitted, sends back the download id to the caller.
   *
   * @param {Object} config
   * @param {Object} request
   * @param {String} origin
   */
  static submitDownload(config, request, origin) {
    chrome.downloads.download(
      {
        url: request.url,
        filename: request.filename || null,
      },
      function(downloadId) {
        if (downloadId) {
          BrowserClient._downloadSuccess(config, request, origin, downloadId);
        } else {
          BrowserClient._downloadFailure(config, request, origin, downloadId);
        }
      },
    );
  }

  /**
   * Helper method to send response once the download completes.
   *
   * @param {Object} config
   * @param {Object} request
   * @param {String} origin
   * @param {Number} downloadId
   */
  static _downloadSuccess(config, request, origin, downloadId) {
    chrome.downloads.search(
      {
        id: downloadId,
      },
      function(results) {
        var downloadItem = results ? results[0] : undefined;
        if (downloadItem) {
          if (downloadItem.state === 'interrupted') {
            BrowserClient._downloadFailure(config, request, origin, downloadId);
          } else {
            BrowserClient._sendResponse(
              config,
              request,
              {
                content: '',
                contentType: downloadItem.mime,
                headers: {},
                responseURL: downloadItem.url,
                statusCode: 200,
              },
              origin,
            );
          }
        } else {
          BrowserClient._downloadFailure(config, request, origin, downloadId);
        }
      },
    );
  }

  /**
   * Helper method to send error response if download failed or interrupted.
   *
   * @param {Object} config
   * @param {Object} request
   * @param {String} origin
   * @param {Number} downloadId
   */
  static _downloadFailure(config, request, origin, downloadId) {
    BrowserClient._sendResponse(
      config,
      request,
      {
        content: '',
        contentType: '',
        headers: {},
        responseURL: '',
        statusCode: 400,
      },
      origin,
    );
  }

  /**
   * Helper method to send response to the caller based on the origin
   *
   * @param {Object} config
   * @param {Object} request
   * @param {Object} httpResponse
   * @param {String} origin
   */
  static _sendResponse(config, request, httpResponse, origin) {
    if (origin === PDFLocator.name) {
      PDFLocator.handleBrowserClientResponse(config, request, httpResponse);
    }
  }
}
/**
 * Module for checking the entitlements of the PDF (whether its downloadable)
 */

/**
 * Class for checking the entitlements of the PDF (whether its downloadable)
 */
class EntitlementChecker {
  /**
   * Method to check for entitlements of the PDF (whether its downloadable)
   *
   * @param {Object} config
   * @param {Object} request
   * @param {String} origin
   */
  static checkEntitlements(config, request, origin) {
    // if its a content match from the CheckPDFDownload call, it will be the pdf link.
    if (request.url) {
      HTTPClient.checkPdfDownload(config, request, EntitlementChecker.name);
    } else {
      EntitlementChecker.sendResponse(config, request, {
        status: 'failure',
        errorMessage: 'no_pdf_link',
      });
    }
  }

  /**
   * Helper method to handle http response from the entitlements request
   *
   * @param {Object} config
   * @param {Object} request
   * @param {Object} httpResponse
   */
  static handleHttpClientResponse(config, request, httpResponse) {
    var response = {
      pdfLink: request.url,
      redirectPdfLink: httpResponse.responseURL,
      parsingStrategy: request.parsingStrategy,
    };
    // if its a content match from the CheckPDFDownload call, it will be the pdf link.
    if (
      (httpResponse.statusCode === 200 && httpResponse.contentType && httpResponse.contentType.includes('application/pdf')) ||
      (httpResponse.headers && httpResponse.headers.includes('.pdf'))
    ) {
      response.status = 'success';
    } else if (httpResponse.statusCode === 200) {
      response.status = 'failure';
      response.errorMessage = 'wrong_content_type';
    } else if (httpResponse.statusCode === 0) {
      response.status = 'failure';
      response.errorMessage = 'request_timed_out';
    } else {
      response.status = 'failure';
      response.errorMessage = 'publisher_url_error';
    }
    if (
      response.status === 'failure' &&
      request.parsingStrategy === 'doi_2_pdf' &&
      (httpResponse.statusCode === 200 || httpResponse.responseURL.includes('aps.org/accepted'))
    ) {
      console.log('Response from doi_2_pdf was a failure, trying other parsing strategies.');
      return ParsingStrategyManager.getPdfUrl(config, request);
    }
    response.publisherResponseCode = httpResponse.statusCode;
    if (request.creativeLicense) {
      response.creativeLicense = request.creativeLicense;
    }
    if (request.publisherHTML) {
      response.publisherHTML = request.publisherHTML;
    }
    EntitlementChecker.sendResponse(config, request, response);
  }

  /**
   * Method to send response.
   *
   * @param {Object} config
   * @param {Object} request
   * @param {Object} response
   */
  static sendResponse(config, request, response) {
    // does nothing for now but in future it can be enhanced.
    PDFLocator.processRequestActions(config, request, response);
  }
}
/**
 * Module for managing DOI to PDF link conversion.
 */

/**
 * Class for managing DOI to PDF link conversion.
 */
class Doi2PdfManager {
  /**
   * Method to get PDF url by applying DOI2PDF rules.
   *
   * If there is no rule for a particular DOI, it simply responds with empty string as pdf link.
   *
   * @param {Object} config
   * @param {Object} request
   */
  static getPdfUrl(config, request) {
    var doi = request.data.articleMetadata.doi;
    var pdfLink = DOIPrefixRulesetHelper.getPdfUrl(doi);
    var prefHttpMethods = DOIPrefixRulesetHelper.getPreferredHttpMethods(doi);
    // if there is rule match, check if the pdf is downloadable, otherwise proceed to other parsing strategies as next step
    if (pdfLink) {
      request.url = pdfLink;
      request.httpMethods = prefHttpMethods;
      request.parsingStrategy = 'doi_2_pdf';
      EntitlementChecker.checkEntitlements(config, request, Doi2PdfManager.name);
    } else {
      ParsingStrategyManager.getPdfUrl(config, request);
    }
  }
}

//----------------Ruleset----------------------
// Rules for DOI2PDF strategy
//----------------Ruleset----------------------
const DOI2PDF_RULE_SET = {
  // Journals covered for this rule -->115
  '10.1002': 'https://onlinelibrary.wiley.com/doi/pdf/{doi}',

  // Journals covered for this rule -->225
  '10.1007': 'https://link.springer.com/content/pdf/{doi}.pdf',

  // Journals covered for this rule -->23
  '10.1021': 'http://pubs.acs.org/doi/pdf/{doi}',

  // Journals covered for this rule -->6
  '10.1023': 'https://link.springer.com/content/pdf/{doi}.pdf',

  // Journals covered for this rule -->4
  '10.1057': 'https://link.springer.com/content/pdf/{doi}.pdf',

  // Journals covered in this if condition -->20
  '10.1061': 'https://ascelibrary.org/doi/pdf/{doi}',

  // Journals covered for this rule -->9
  '10.1063': 'https://aip.scitation.org/doi/pdf/{doi}',

  // Journals covered for this rule -->80
  '10.1080': 'http://www.tandfonline.com/doi/pdf/{doi}?needAccess=true',

  // Journals covered for this rule -->23
  // IOP is throttling calls, and ends up IP blocking requests because we hit it with too many requests.
  // We may need to comment this out based on how often this is happening.
  // Without ViewPDF Button enabled, the likelihood of this is lower, but if we turn ViewPDF on,
  // We should turn this rule off or users will get blocked just for searching for a Source from IOP (ex. New Journal of Physics)
  '10.1088': 'https://iopscience.iop.org/article/{doi}/pdf',

  // Journals covered for this rule -->18(?)
  // This rule actually only works for APS's Chorus Open Access articles.
  // As a fallback, there is an adhoc rule that is called if this fails, which covers all other cases.
  // Similar to IOP, this rule should be revisited if we ever enable ViewPDF button, as too many requests results in a permanent IP block
  '10.1103': 'http://link.aps.org/accepted/{doi}',

  // Journals covered for this rule -->47
  '10.1108': 'http://www.emeraldinsight.com/doi/pdfplus/{doi}',

  // Journals covered for this rule -->121
  '10.1111': 'https://onlinelibrary.wiley.com/doi/pdf/{doi}',

  // Journals covered for this rule -->5
  '10.1134': 'https://link.springer.com/content/pdf/{doi}.pdf',

  // Journals covered for this rule -->12(?)
  // This rule works if the user has the proper entitlements, or if Open Access.
  // Otherwise, will download annual report but rename it to the document name! So, better just to leave it all out so as not to confuse users I think.
  //'10.1161': 'https://www.ahajournals.org/doi/pdf/{doi}',

  // Journals covered for this rule -->48
  '10.1177': 'http://journals.sagepub.com/doi/pdf/{doi}',

  // Journals covered for this rule -->8
  '10.1371': 'http://journals.plos.org/ploscompbiol/article/file?id={doi}&type=printable',

  // Journals covered for this rule -->15
  // '10.3389': 'https://www.frontiersin.org/articles/{doi}/pdf',

  // Journals covered for this rule -->1
  // '10.1029': 'https://agupubs.onlinelibrary.wiley.com/doi/pdf/{doi}',

  // Journals covered for this rule -->1
  // '10.1034': 'https://onlinelibrary.wiley.com/doi/pdf/{doi}',

  // Journals covered for this rule -->2
  // '10.1046': 'https://onlinelibrary.wiley.com/doi/pdf/{doi}',

  // Journals covered for this rule -->2
  // '10.1055': 'http://www.thieme-connect.de/products/ejournals/pdf/{doi}.pdf',

  // Journals covered for this rule -->2
  // '10.1068': 'http://journals.sagepub.com/doi/pdf/{doi}',

  // Journals covered for this rule -->1
  // '10.1113': 'https://physoc.onlinelibrary.wiley.com/doi/pdf/{doi}',

  // Journals covered for this rule -->1
  // '10.1117':'https://www.spiedigitallibrary.org/conference-proceedings-of-spie/8955/895514/Nanocapsules-of-perfluorooctyl-bromide-for-theranostics--from-formulation-to/{doi}.pdf',

  // Journals covered for this rule -->1
  // '10.1119': 'https://aapt.scitation.org/doi/pdf/{doi}',

  // Journals covered for this rule -->1
  // '10.1121': 'https://asa.scitation.org/doi/pdf/{doi}',

  // Journals covered for this rule -->2
  // '10.1140': 'https://link.springer.com/content/pdf/{doi}.pdf',

  // Journals covered for this rule -->3
  // '10.1179': 'http://www.tandfonline.com/doi/pdf/{doi}?needAccess=true',

  // Journals covered for this rule -->2
  // '10.1186': 'https://health-policy-systems.biomedcentral.com/track/pdf/{doi}',

  // Journals covered for this rule -->1
  // '10.1207': 'https://onlinelibrary.wiley.com/doi/pdf/{doi}',

  // Journals covered for this rule -->1
  // '10.1208': 'https://link.springer.com/content/pdf/{doi}.pdf',

  // Journals covered for this rule -->1
  // '10.1209': 'http://iopscience.iop.org/article/{doi}/pdf',

  // Journals covered for this rule -->3
  // '10.1243': 'http://journals.sagepub.com/doi/pdf/{doi}',

  // Journals covered for this rule -->1
  // '10.1257': 'https://www.aeaweb.org/articles/pdf/doi/{doi}',

  // Journals covered for this rule -->1
  // '10.1385': 'https://link.springer.com/content/pdf/{doi}.pdf',

  // Journals covered for this rule -->1
  // '10.1617': 'https://link.springer.com/content/pdf/{doi}.pdf',

  // Journals covered for this rule -->2
  // '10.1631': 'https://link.springer.com/content/pdf/{doi}.pdf',

  // Journals covered for this rule -->1
  // '10.1902': 'https://onlinelibrary.wiley.com/doi/pdf/{doi}',

  // Journals covered for this rule -->1
  // '10.2165': 'https://link.springer.com/content/pdf/{doi}.pdf',

  // Journals covered for this rule -->3
  // '10.2190': 'http://journals.sagepub.com/doi/pdf/{doi}',

  // Journals covered for this rule -->1
  // '10.2307': 'https://esajournals.onlinelibrary.wiley.com/doi/pdf/{doi}',

  // Journals covered for this rule -->1
  // '10.2351': 'https://lia.scitation.org/doi/pdf/{doi}',

  // Journals covered for this rule -->1
  // '10.2501': 'http://www.tandfonline.com/doi/pdf/{doi}?needAccess=true',

  // Journals covered for this rule -->1
  // '10.3103': 'https://link.springer.com/content/pdf/{doi}.pdf',

  // Journals covered for this rule -->1
  // '10.3109': 'http://www.tandfonline.com/doi/pdf/{doi}?needAccess=true',

  // Journals covered for this rule -->1
  // '10.3402': 'http://www.tandfonline.com/doi/pdf/{doi}?needAccess=true',

  // Journals covered for this rule -->1
  // '10.3727': 'http://journals.sagepub.com/doi/pdf/{doi}',

  // Journals covered for this rule -->1
  // '10.3758': 'https://link.springer.com/content/pdf/{doi}.pdf',

  // Journals covered for this rule -->2
  // '10.3844': 'http://thescipub.com/pdf/{doi}',

  // Journals covered for this rule -->1
  // '10.3846': 'http://www.tandfonline.com/doi/pdf/{doi}?needAccess=true',

  // Journals covered for this rule -->1
  // '10.4081': 'http://www.tandfonline.com/doi/pdf/{doi}?needAccess=true',

  // Journals covered for this rule -->1
  // '10.4276': 'http://journals.sagepub.com/doi/pdf/{doi}',

  // Journals covered for this rule -->1
  // '10.5004': 'http://www.tandfonline.com/doi/pdf/{doi}?needAccess=true',

  // Journals covered for this rule -->1
  // '10.5367': 'http://journals.sagepub.com/doi/pdf/{doi}',

  // Journals covered for this rule -->1
  // '10.5721': 'http://www.tandfonline.com/doi/pdf/{doi}?needAccess=true',

  // Journals covered for this rule -->1
  // '10.7567': 'http://iopscience.iop.org/article/{doi}/pdf',

  //Total conditions covered --> 54
  //Total publishers covered in this ruleset --> 801
};

/**
 * Helper class for DOI to PDF Url conversion
 */
class DOIPrefixRulesetHelper {
  /**
   * Helper method to retrieve all the DOI2PDF rules
   */
  static getRules() {
    return DOI2PDF_RULE_SET;
  }

  /**
   * Helper method to retrieve all preferred methods based on doi prefix.
   */
  static getHttpMethodsForPrefix() {
    //---------------- Preferred HTTP methods ----------------------
    const PREFERRED_HTTP_METHODS = {
      //'10.3389': ['GET'],
      //'10.1055': ['GET']
    };
    return PREFERRED_HTTP_METHODS;
  }

  /**
   * Helper method to generate pdf url based on DOI prefix
   *
   * @param {String} doi
   */
  static getPdfUrl(doi) {
    var rules = DOIPrefixRulesetHelper.getRules();
    var doiPrefix = doi.split('/')[0];
    var pdfLink = '';
    if (rules.hasOwnProperty(doiPrefix)) {
      pdfLink = rules[doiPrefix];
      pdfLink = pdfLink.replace('{doi}', doi);
    }
    return pdfLink;
  }

  /**
   * Helper method to get preferred http method to check if pdf can be downloaded based on DOI prefix rules.
   *
   * @param {String} doi
   */
  static getPreferredHttpMethods(doi) {
    var prefMethods = DOIPrefixRulesetHelper.getHttpMethodsForPrefix();
    var doiPrefix = doi.split('/')[0];
    var httpMethods = [];
    if (prefMethods && prefMethods.hasOwnProperty(doiPrefix)) {
      httpMethods = prefMethods[doiPrefix];
    }

    return httpMethods;
  }
}
/**
 * Module for managing different parsing strategy to locate a PDF.
 */

/**
 * Class for managing different parsing strategy.
 */
class ParsingStrategyManager {
  /**
   * Method to get PDF url by applying different strategies like 'meta_tag', 'adhoc_rule', 'ml_algorithm', etc.
   *
   * If there is no rule for a particular DOI, it simply responds with empty string as pdf link.
   *
   * @param {Object} config
   * @param {Object} request
   */
  static getPdfUrl(config, request) {
    if (request.data.articleMetadata.doi) {
      request.url = config.doiBaseUrl + request.data.articleMetadata.doi;
    } else {
      request.url = request.data.articleMetadata.fullTextURL;
    }
    request.isPublisherPage = true;
    HTTPClient.getContent(config, request, ParsingStrategyManager.name);
  }

  /**
   * Helper method to handle http response from the entitlements request
   *
   * @param {Object} config
   * @param {Object} request
   * @param {Object} httpResponse
   */
  static handleHttpClientResponse(config, request, httpResponse) {
    if (httpResponse.statusCode === 200) {
      // if the response content is pdf, then its a direct download
      if (request.isPublisherPage && httpResponse.contentType && httpResponse.contentType.includes('application/pdf')) {
        request.parsingStrategy = 'direct_download';
        EntitlementChecker.handleHttpClientResponse(config, request, httpResponse);

        // otherwise proceed with the next steps.
      } else {
        var htmlDoc = PDFLocatorUtil.getHTMLDoc(httpResponse.content);
        var isInterimPage = ParsingStrategyManager._checkInterimPage(config, request, httpResponse, htmlDoc);
        if (!isInterimPage) {
          request.creativeLicense = ParsingStrategyManager._getCreativeLicense(htmlDoc);
          // apply all strategies to extract pdf link
          ParsingStrategyManager._applyStrategies(config, request, httpResponse, htmlDoc);
        }
      }
    } else {
      EntitlementChecker.handleHttpClientResponse(config, request, httpResponse);
    }
  }

  /**
   * Helper method to apply different parsing strategies and checks if it can be downloaded.
   *
   * @param {Object} config
   * @param {Object} request
   * @param {Object} httpResponse
   * @param {Object} htmlDoc
   */
  static _applyStrategies(config, request, httpResponse, htmlDoc) {
    var pdfLink = '';
    var parsingStrategy = 'NA';
    var isPdfLinkFound = false;

    // determine pdfLink using 'meta_tag' strategy
    pdfLink = MetaTagHelper.getPdfUrl(config, request, httpResponse, htmlDoc);
    if (pdfLink) {
      parsingStrategy = 'meta_tag';
      isPdfLinkFound = true;
    }

    // determine pdfLink using 'adhoc_rule' strategy
    if (!isPdfLinkFound) {
      pdfLink = AdHocRuleHelper.getPdfUrl(config, request, httpResponse, htmlDoc);
      if (pdfLink) {
        parsingStrategy = 'adhoc_rule';
        isPdfLinkFound = true;
      }
    }

    // determine pdfLink using 'ml_algorithm' strategy
    if (!isPdfLinkFound) {
      pdfLink = MLHelper.getPdfUrl(config, request, httpResponse, htmlDoc);
      if (pdfLink) {
        parsingStrategy = 'ml_algorithm';
        isPdfLinkFound = true;
      }
    }

    request.url = pdfLink;
    request.parsingStrategy = parsingStrategy;
    if (request.data.options.publisherHTML) {
      request.publisherHTML = httpResponse.content;
    }
    EntitlementChecker.checkEntitlements(config, request, ParsingStrategyManager.name);
  }

  /**
   * Helper method to handle any interim page
   *
   * @param {Object} config
   * @param {Object} request
   * @param {Object} response
   * @param {Object} htmlDoc
   */
  static _checkInterimPage(config, request, response, htmlDoc) {
    var domain = PDFLocatorUtil.getDomainUrl(response.responseURL) || '';
    var isInterimPage = false;
    // handle linkinghub or ieee interim pages
    if (domain.includes('linkinghub.elsevier.com') || (domain.includes('ieee.org') && !request.url.includes('.jsp'))) {
      if (domain.includes('linkinghub.elsevier.com')) {
        request.url =
          decodeURIComponent(decodeURIComponent(htmlDoc.querySelector('input[name=redirectURL]').getAttribute('value') || '')).split('?')[0] +
          '/pdfft?isDTMRedir=true';
        console.log(request.url);
        // This will only be hit if a IEEE request does not return content-type application/pdf header in HEAD request
      } else if (domain.includes('ieee.org')) {
        if (!response.responseURL.includes('.jsp')) {
          var elem = document.evaluate("//script[contains(text(), 'global.document.metadata')]", htmlDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
            .singleNodeValue;
          var found;
          if (elem) {
            // Regex to match "pdfUrl":"/stamp/stamp.jsp?tp=&arnumber=7857751"
            found = elem.innerText.match(/"pdfUrl"[^:]*:[^"]*"([^"]+)"/);
          }
          request.url = 'https://ieeexplore.ieee.org' + decodeURIComponent(found[1] || '');
        }
      }
      request.isPublisherPage = true;
      isInterimPage = true;
      if (request.url) {
        HTTPClient.getContent(config, request, ParsingStrategyManager.name);
      }
    }
    return isInterimPage;
  }

  /**
   * Helper method to get creative license information from the html source.
   *
   * @param {Object} htmlDoc
   */
  static _getCreativeLicense(htmlDoc) {
    var elem = htmlDoc.querySelector('a[href*="creativecommons.org/licenses"]');
    return elem ? elem.getAttribute('href') : '';
  }
}
/**
 * Module for extracting pdf link from meta tag.
 */

/**
 * Helper for extracting pdf link from meta tag.
 */
class MetaTagHelper {
  /**
   * Method to determine pdf url using "citation_pdf_url" meta tag.
   *
   * @param {Object} config
   * @param {Object} request
   * @param {Object} httpResponse
   * @param {Object} htmlDoc
   */
  static getPdfUrl(config, request, httpResponse, htmlDoc) {
    var pdfUrl;
    var metaTag = htmlDoc.querySelector('meta[name="citation_pdf_url"]');
    if (metaTag) {
      pdfUrl = metaTag.getAttribute('content') || '';
    }
    return pdfUrl;
  }
}
/**
 * Module for managing all Ad-Hoc rules
 */

/**
 * Constant to hold domain names to publisher names mapping
 * This can also use hold a wild card entry like {'*.elsevier.com': 'ScienceDirect'}
 */
// Commenting out few publishers purposefully to make them inactive for now.
// They are either covered on doi_2_pdf or meta_tag parsing strategy.
const DOMAINS_TO_PUBLISHERS = {
  //'www.sciencedirect.com': 'ScienceDirect',
  'www.nejm.org': 'JournalOfMedicine',
  //'www.nature.com': 'NATURE', // - covered in meta_tag
  'journals.sagepub.com': 'Sage',
  //'www.emeraldinsight.com': 'Emerald', // - covered in doi_2_pdf
  //'www.tandfonline.com': 'TaylorFrancis', // - covered in doi_2_pdf
  'ieeexplore.ieee.org': 'IEEE',
  //'aip.scitation.org': 'AIP', // - covered in meta_tag
  // 'pubs.acs.org': 'ACSPH', // - covered in doi_2_pdf
  'ascelibrary.org': 'ASCE',
  'journals.aps.org': 'APS',
  //'*.sciencemag.org': 'AAAOS', // - covered in meta_tag
  //'www.degruyter.com': 'Gruyter', // - covered in meta_tag
  'www.igi-global.com': 'IGIGlobal',
  //'springerplus.springeropen.com': 'SpringerPlus' // - covered in meta_tag

  // 'www.clinicalkey.com.au': 'ClinicalKey', // - currently will not work due to a loading screen before the page content loads.
  // From what I have seen, sometimes LinkingHub will redirect here instead of to science direct,
  // even though I believe most articles on CK are also on SD
  // If clinical key becomes the default/standard for linkinghub's redirectUrl,
  // we should try to fix the parsingStrategyManager._checkInterimPage handling of linkinghub
};

// Constant to hold wild card domains
const WILDCARD_DOMAINS_TO_PUBLISHERS = Object.keys(DOMAINS_TO_PUBLISHERS).filter((k) => k.includes('*'));

// Constant to hold different adhoc rules
const ADHOC_RULES = {
  ScienceDirect: (htmlDoc) => {
    var elem = htmlDoc.querySelector('a[href^="https://pdf.sciencedirectassets.com"]');
    return elem ? elem.getAttribute('href') : '';
  },
  ClinicalKey: (htmlDoc) => {
    var elem = htmlDoc.querySelector('a[data-action="pdfDownload"]');
    console.log('ClinicalKey adhoc rule used' + (elem ? elem.getAttribute('href') : ''));
    return elem ? elem.getAttribute('href') : '';
  },
  JournalOfMedicine: (htmlDoc) => {
    var elem = htmlDoc.querySelector('a[href*="doi/pdf"]');
    return elem ? elem.getAttribute('href') : '';
  },
  NATURE: (htmlDoc) => {
    var elem = htmlDoc.querySelector('a[data-track-dest="link:PDF"]');
    return elem ? elem.getAttribute('href') : '';
  },
  Sage: (htmlDoc) => {
    var elem = htmlDoc.querySelector('a[href*="doi/pdf"]');
    return elem ? elem.getAttribute('href') : '';
  },
  Emerald: (htmlDoc) => {
    var elem = htmlDoc.querySelector('a[href*="doi/pdf"]');
    return elem ? elem.getAttribute('href') : '';
  },
  TaylorFrancis: (htmlDoc) => {
    var elem = htmlDoc.querySelector('a[href*="doi/pdf"]');
    return elem ? elem.getAttribute('href') : '';
  },
  IEEE: (htmlDoc) => {
    var elem = htmlDoc.querySelector('iframe[src^="https://ieeexplore.ieee.org"]');
    return elem ? elem.getAttribute('src') : '';
  },
  AIP: (htmlDoc) => {
    var elem = htmlDoc.querySelector('.article-menu .download-pdf a');
    return elem ? elem.getAttribute('href') : '';
  },
  ACSPH: (htmlDoc) => {
    var elem = htmlDoc.querySelector('.publicationFormatList li:nth-child(2) a');
    return elem ? elem.getAttribute('href') : '';
  },
  ASCE: (htmlDoc) => {
    var elem = htmlDoc.querySelector('.icon-download');
    return elem ? elem.getAttribute('href') : '';
  },
  APS: (htmlDoc) => {
    var elem = htmlDoc.querySelector('.button.expand');
    return elem ? elem.getAttribute('href') : '';
  },
  AAAOS: (htmlDoc) => {
    var elem = htmlDoc.querySelector('meta[name="citation_full_html_url"]');
    return elem ? elem.getAttribute('content') + '.pdf' : '';
  },
  Gruyter: (htmlDoc) => {
    var elem = htmlDoc.querySelector('meta[name="citation_pdf_url"]');
    return elem ? elem.getAttribute('content') : '';
  },
  IGIGlobal: (htmlDoc) => {
    var elem = htmlDoc.querySelector('a[href*="pdf/"');
    return elem ? elem.getAttribute('href') : '';
  },
  SpringerPlus: (htmlDoc) => {
    var elem = htmlDoc.querySelector('#articlePdf');
    return elem ? elem.getAttribute('href') : '';
  },
};

/**
 * Helper class for applying ad-hoc rules to determine pdf link.
 */
class AdHocRuleHelper {
  /**
   * Method to determine pdf url using ad-hoc rules.
   *
   * @param {Object} config
   * @param {Object} request
   * @param {Object} httpResponse
   * @param {Object} htmlDoc
   */
  static getPdfUrl(config, request, httpResponse, htmlDoc) {
    var publisherName = AdHocRuleHelper._determinePublisherName(httpResponse, htmlDoc);
    return AdHocRuleHelper._appyAdHocRule(httpResponse, htmlDoc, publisherName);
  }

  /**
   * Helper method to determine publisher name.
   *
   * @param {Object} httpResponse
   * @param {Object} htmlDoc
   */
  static _determinePublisherName(httpResponse, htmlDoc) {
    var domain = PDFLocatorUtil.getDomainUrl(httpResponse.responseURL, false) || '';
    var pubName = DOMAINS_TO_PUBLISHERS[domain];

    // if no match, look for wild card entries
    if (domain && !pubName && WILDCARD_DOMAINS_TO_PUBLISHERS) {
      for (const name of WILDCARD_DOMAINS_TO_PUBLISHERS) {
        if (domain.includes(name.replace('*', ''))) {
          pubName = DOMAINS_TO_PUBLISHERS[name][domain];
          break;
        }
      }
    }
    return pubName || '';
  }

  /**
   * Helper method to determine pdf url using ad-hoc rules.
   *
   * @param {Object} httpResponse
   * @param {Object} htmlDoc
   * @param {String} publisherName
   */
  static _appyAdHocRule(httpResponse, htmlDoc, publisherName) {
    var pdfLink = publisherName ? ADHOC_RULES[publisherName](htmlDoc) : '';
    if (pdfLink && !PDFLocatorUtil.isAbsoluteUrl(pdfLink)) {
      pdfLink = PDFLocatorUtil.getAbsoluteUrl(pdfLink, PDFLocatorUtil.getDomainUrl(httpResponse.responseURL));
    }
    return pdfLink;
  }
}
/**
 * Module that holds the Machine Learning classifier.
 */

/**
 * Class that represents Machine Learning Classifier.
 */
class MLClassifier {
  /**
   * This method is used to predict whether the link is a target or not.
   * If multiple links are determined True, there will be a rank associated with it.
   *
   * @param {Object} params
   */
  static predict(params) {
    //var featCount = DDMMLClassifier.validateParams(params);
    MLClassifier.validateParams(params);
    var rank = 0;
    var result;

    if (params.doiInContent <= 0.5) {
      if (params.termPdfFoundInCss <= 0.5) {
        if (params.termDownloadInContent <= 0.5) {
          if (params.linktextPdf <= 0.5) {
            rank = 4;
            result = false;
          } else {
            if (params.linkEndWithPdfExt <= 0.5) {
              rank = 5;
              result = false;
            } else {
              if (params.termTermsFormInContent <= 0.5) {
                rank = 6;
                result = true;
              } else {
                rank = 6;
                result = false;
              }
            }
          }
        } else {
          rank = 3;
          result = true;
        }
      } else {
        rank = 2;
        result = true;
      }
    } else {
      if (params.termPdfInContent <= 0.5) {
        if (params.linktextPdf <= 0.5) {
          rank = 3;
          result = false;
        } else {
          rank = 3;
          result = true;
        }
      } else {
        rank = 2;
        result = true;
      }
    }

    // return the predicted result and rank
    return {
      result: result,
      rank: rank,
    };
  }

  /**
   * A function to return all valid feature names
   */
  static getFeatures() {
    return ['termTermsFormInContent', 'doiInContent', 'termPdfFoundInCss', 'termPdfInContent', 'linkEndWithPdfExt', 'linktextPdf', 'termDownloadInContent'];
  }

  /**
   * Function to validate the input parameters against the valid list of features.
   *
   * @param {Object} params
   */
  static validateParams(params) {
    var features = MLClassifier.getFeatures();
    features.forEach(function(key) {
      if (!params.hasOwnProperty(key)) {
        throw Error('Feature ' + key + ' is missing in the input: ' + params);
      }
    });
    return features.length;
  }
}
/**
 * Module for interacting with Machine Learning classifier.
 */

/**
 * Helper for interacting with Machine Learning classifier.
 */
class MLHelper {
  /**
   * Method to determine pdf url using machine learning algorithm.
   *
   * @param {Object} config
   * @param {Object} request
   * @param {Object} httpResponse
   * @param {Object} htmlDoc
   */
  static getPdfUrl(config, request, httpResponse, htmlDoc) {
    var linkParams = MLHelper._getFeatures(request.data.articleMetadata.doi, htmlDoc);
    var pdfLink = MLHelper._predictLink(request, linkParams);
    if (pdfLink && !PDFLocatorUtil.isAbsoluteUrl(pdfLink)) {
      pdfLink = PDFLocatorUtil.getAbsoluteUrl(pdfLink, PDFLocatorUtil.getDomainUrl(httpResponse.responseURL));
      if (request.data.articleMetadata.doi) {
        LogHelper.logDebug('DOI: ' + request.data.articleMetadata.doi + ' -> ML absolute pdfLink --> ' + pdfLink);
      } else {
        LogHelper.logDebug('FullTextURL: ' + request.data.articleMetadata.fullTextURL + ' -> ML absolute pdfLink --> ' + pdfLink);
      }
    }
    return pdfLink;
  }

  /**
   * Pre-processing helper function to retrieve input features for ML algorithm.
   *
   * @param {String} doi
   * @param {Object} htmlDoc
   */
  static _getFeatures(doi, htmlDoc) {
    var linkParams = [];
    var links = htmlDoc.querySelectorAll('a,link,form');
    var features;
    links.forEach((elem, ind) => {
      features = MLHelper._extractFeatures(ind, elem, doi, links.length);
      features = Object.assign(
        {
          pdflink: elem.getAttribute('href') || '',
        },
        features,
      );
      linkParams.push(features);
    });
    return linkParams;
  }

  /**
   * Helper function to extract input features for ML algorithm.
   *
   * @param {int} ind
   * @param {Object} linkObj
   * @param {String} doi
   * @param {int} totalLinks
   */
  static _extractFeatures(ind, linkObj, doi, totalLinks) {
    var linkText = linkObj.textContent;
    // Update the below features based on the trained classifier

    return {
      termPdfFoundInCss: MLHelper._numericBool(PDFLocatorUtil.containsText(linkObj.getAttribute('class'), 'pdf')),
      termDownloadInContent: MLHelper._numericBool(PDFLocatorUtil.containsText(linkObj.getAttribute('href'), 'download')),
      termPdfInContent: MLHelper._numericBool(PDFLocatorUtil.containsText(linkObj.getAttribute('href'), 'pdf')),
      termTermsFormInContent: MLHelper._numericBool(MLHelper._termsInTitleCandidate(['terms', 'form'], linkObj.getAttribute('href'))),
      linktextPdf: MLHelper._numericBool(PDFLocatorUtil.containsText(linkText, 'pdf')),
      linkEndWithPdfExt: MLHelper._numericBool(PDFLocatorUtil.endsWith(linkObj.getAttribute('href'), 'pdf')),
      //tagRelativePos: ind / totalLinks,
      //tagIsA: MLHelper._numericBool(linkObj.prop('tagName').toLowerCase() === 'a'),
      //hasImgChild: MLHelper._numericBool(linkObj.children().is('img')),
      doiInContent: MLHelper._numericBool(PDFLocatorUtil.containsText(linkObj.getAttribute('href'), doi)),
    };
  }

  /**
   * Helper function to predict links, sort by rank and get one valid link
   *
   * @param {Object} request
   * @param {Array} linkParams
   */
  static _predictLink(request, linkParams) {
    var predictedLinks = [];
    var determinedLink = '';
    linkParams.forEach(function(params) {
      var res = MLClassifier.predict(params);
      predictedLinks.push({
        result: res.result,
        rank: res.rank,
        pdflink: params.pdflink,
      });
    });
    var sortedLinks = predictedLinks
      .filter((p) => p.result)
      .sort(function(a, b) {
        //return a.rank - b.rank;
        return b.rank - a.rank;
      });

    for (let index = 0; index < sortedLinks.length; index++) {
      determinedLink = sortedLinks[index].pdflink || '';
      determinedLink = determinedLink.trim();
      if (determinedLink && !determinedLink.startsWith('#')) {
        break;
      }
    }
    if (request.data.articleMetadata.doi) {
      LogHelper.logDebug('DOI: ' + request.data.articleMetadata.doi + ' -> ML predicted links --> ', sortedLinks);
      LogHelper.logDebug('DOI: ' + request.data.articleMetadata.doi + ' -> ML determined link --> ' + determinedLink);
    } else {
      LogHelper.logDebug('FullTextURL: ' + request.data.articleMetadata.fullTextURL + ' -> ML predicted links --> ', sortedLinks);
      LogHelper.logDebug('FullTextURL: ' + request.data.articleMetadata.fullTextURL + ' -> ML determined link --> ' + determinedLink);
    }
    return determinedLink;
  }

  /**
   * Helper function to check if the url (last part of the path param) contaims the term.
   *
   * @param {Array} terms
   * @param {String} hrefVal
   */
  static _termsInTitleCandidate(terms, hrefVal) {
    if (!hrefVal || typeof terms === 'undefined') {
      return false;
    }
    var titleTxt = hrefVal
      .split('?')[0]
      .split('/')
      .reverse()[0];
    return terms.some(function(e) {
      return titleTxt.toLowerCase().indexOf(e) > -1;
    });
  }

  /**
   * Helper function to convert boolean to numberic.
   *
   * @param {Boolean} flag
   */
  static _numericBool(flag) {
    return flag ? 1 : 0;
  }
}
/**
 * Main module for PDF Locator
 */

/**
 * Main class for PDF Locator JS library
 *
 */
class PDFLocator {
  /**
   * Entry method for PDF Locator library to locate a pdf link or download or get pdf content.
   *
   * @param {Object} requestMsg
   * @param {Function} callback
   */
  static locatePDF(requestMsg, callback) {
    var request = {
      data: requestMsg.data,
      tabId: requestMsg.tabId,
      callback: callback,
      extensionName: requestMsg.extensionName,
    };
    try {
      var config = ConfigUtil.getConfig(request.data);
      request.options = config.options || {};
      // validate input data
      PDFLocator._validateInput(request.data);

      if (request.data.articleMetadata.doi) {
        Doi2PdfManager.getPdfUrl(config, request);
      } else {
        ParsingStrategyManager.getPdfUrl(config, request);
      }
    } catch (err) {
      PDFLocator.dispatchErrorResponse(request, {}, err.message);
    }
  }

  /**
   * Method to process the input actions.
   *
   * Note: Getting pdf url is mandatory for any action.
   *
   * @param {Object} config
   * @param {Object} request
   * @param {Object} response
   */
  static processRequestActions(config, request, response) {
    var dispatch = true;
    if ((request.data.action === 'GetPDF' && response.status === 'success') || (request.data.action === 'DownloadPDF' && response.status === 'success')) {
      request.url = response.pdfLink;
      // Use the redirected link if it exists.
      if (response.redirectPdfLink) {
        if (response.redirectPdfLink != response.pdfLink) {
          request.url = response.redirectPdfLink;
        }
      }
      request.pdfLinkResponse = response;
      dispatch = false;
      if (request.data.action === 'DownloadPDF') {
        request.filename = request.data.options && request.data.options.downloadFileName;
        BrowserClient.submitDownload(config, request, PDFLocator.name);
      } else {
        HTTPClient.getContent(config, request, PDFLocator.name);
      }
    }
    if (dispatch) {
      PDFLocator.dispatchResponse(request, response);
    }
  }

  /**
   * Handler method for handling response from other modules and dispatching to the caller using callback.
   *
   * @param {Object} request
   * @param {Object} response
   */
  static dispatchResponse(request, response) {
    var responseData = {};
    responseData.id = request.data.id;
    responseData.action = request.data.action;

    // pdf metadata
    var redirectLink;
    if (response.redirectPdfLink) {
      redirectLink = response.redirectPdfLink;
    } else {
      redirectLink = '';
    }
    responseData.pdfMetadata = {
      url: response.pdfLink,
      redirectUrl: redirectLink,
      success: response.status === 'success',
    };
    if (request.data.action === 'GetPDF') {
      responseData.pdfMetadata.content = response.content || '';
      responseData.pdfMetadata.message = response.errorMessage || '';
    }

    // optional data - logging
    responseData.optionalData = {};
    if (request.data.options && request.data.options.loggingData) {
      responseData.optionalData.loggingData = {
        parsingStrategy: response.parsingStrategy,
        publisherResponseCode: response.publisherResponseCode,
        creativeLicense: response.creativeLicense || '',
        errorMessage: response.errorMessage || '',
      };
    }
    // optional data - publisher html
    if (request.data.options && request.data.options.publisherHTML) {
      responseData.optionalData.publisherHTML = response.publisherHTML;
    }

    // opaque data
    if (request.data.opaque) {
      responseData.opaque = request.data.opaque;
    }
    request.callback(responseData);
  }

  /**
   * Handler method for handling error response
   *
   * @param {Object} request
   * @param {Object} response
   * @param {String} message
   */
  static dispatchErrorResponse(request, response, message) {
    var responseData = {};
    responseData.id = request.data.id;
    responseData.action = request.data.action;

    // pdf metadata
    responseData.pdfMetadata = {
      url: '',
      redirectUrl: '',
      success: false,
      message: message,
    };

    // optional data
    responseData.optionalData = {};
    if (request.data.options && request.data.options.loggingData) {
      responseData.optionalData.loggingData = {};
    }

    // opaque data
    if (request.data.opaque) {
      responseData.opaque = request.data.opaque;
    }
    request.callback(responseData);
  }

  /**
   * Helper method to handle http response from http client
   *
   * @param {Object} config
   * @param {Object} request
   * @param {Object} httpResponse
   */
  static handleHttpClientResponse(config, request, httpResponse) {
    httpResponse = Object.assign(request.pdfLinkResponse || {}, httpResponse);
    if (httpResponse.statusCode === 200) {
      httpResponse.status = 'success';
    } else {
      httpResponse.status = 'failure';
      httpResponse.errorMessage = 'pdf_url_error';
    }
    PDFLocator.dispatchResponse(request, httpResponse);
  }

  /**
   * Helper method to handle response from browser client
   *
   * @param {Object} config
   * @param {Object} request
   * @param {Object} httpResponse
   */
  static handleBrowserClientResponse(config, request, httpResponse) {
    httpResponse = Object.assign(request.pdfLinkResponse || {}, httpResponse);
    if (httpResponse.statusCode === 200) {
      httpResponse.status = 'success';
    } else {
      httpResponse.status = 'failure';
      httpResponse.errorMessage = httpResponse.downloadState;
    }
    PDFLocator.dispatchResponse(request, httpResponse);
  }

  /**
   * Helper method to validate input data
   *
   * @param {Object} request
   */
  static _validateInput(request) {
    if (!request || !request.articleMetadata) {
      throw Error('Invalid input!. Input data is missing "articleMetadata".');
    }
    if (!request.articleMetadata.doi && !request.articleMetadata.fullTextURL) {
      throw Error('Invalid input!. Either "doi" or "fullTextURL" is requred to process request.');
    }
  }
}
