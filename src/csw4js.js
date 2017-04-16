var Csw4js = {};

Csw4js.version = '0.0.1';

Csw4js.Ows = {};
Csw4js.Fes = {};

Csw4js.NOTIE = true; // here's hoping

Csw4js.Proxy = '/cgi-bin/proxy.cgi?url=';
Csw4js.Util = {};

if (window.ActiveXObject) {
    Csw4js.NOTIE = false;
}

Csw4js.Namespaces = {
    'csw': 'http://www.opengis.net/cat/csw/2.0.2',
    'ogc': 'http://www.opengis.net/ogc',
    'ows': 'http://www.opengis.net/ows',
    'xlink': 'http://www.w3.org/1999/xlink'
};

/**
 * Jsonix CSW unmarshaller
 *
 * */

Csw4js.unmarshaller = new Jsonix.Context([OWS_1_0_0, DC_1_1, DCT, XLink_1_0, CSW_2_0_2]).createUnmarshaller();

Csw4js.IESelectionNamespaces = function() {
    var namespaces = [];
    for(var key in Csw4js.Namespaces) {
        namespaces.push(key + ':\'' + Csw4js.Namespaces[key] + '\'');
    }
    return namespaces.join(' ');
};

Csw4js.nsResolver = function(prefix) {
    return Csw4js.Namespaces[prefix] || null;
};

Csw4js.getXPathNode = function(doc, xpath) {
    var evaluator = new XPathEvaluator();
    var result = evaluator.evaluate(xpath, doc, Csw4js.nsResolver,
        XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    return result.singleNodeValue;
};

Csw4js.getXPathNodeList = function(doc, xpath) {
    var evaluator = new XPathEvaluator();
    var iter = evaluator.evaluate(xpath, doc, Csw4js.nsResolver,
        XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
    return iter;
};
Csw4js.getXPathValue = function(doc, xpath) {
    var evaluator = new XPathEvaluator();
    var result = evaluator.evaluate(xpath, doc, Csw4js.nsResolver,
        XPathResult.STRING_TYPE, null);
    return result.stringValue;
};

Csw4js.getXPathValueList = function(doc, xpath) {
    var list = [];
    var evaluator = new XPathEvaluator();
    var iter = evaluator.evaluate(xpath, doc, Csw4js.nsResolver,
        XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
    var node = iter.iterateNext();
    while (node) {
        list.push(node.value);
        node = iter.iterateNext();
    }
    return list;
};

Csw4js.getXPathNodeAttributeValue = function(doc, xpath){
    return doc.getAttributeNode(xpath).value;
}

Csw4js.Ows.ServiceIdentification = function(node) {
    this.title = Csw4js.getXPathValue(node, 'ows:Title');
    this.abstract = Csw4js.getXPathValue(node, 'ows:Abstract');
    this.keywords = Csw4js.getXPathValueList(node, 'ows:Keywords/ows:Keyword');
    this.type = Csw4js.getXPathValue(node, 'ows:ServiceType');
    this.version = Csw4js.getXPathValue(node, 'ows:ServiceTypeVersion');
    this.fees = Csw4js.getXPathValue(node, 'ows:Fees');
    this.accessconstraints = Csw4js.getXPathValue(node,
        'ows:AccessConstraints');
};

Csw4js.Ows.ServiceProvider = function(node) {
    this.name = Csw4js.getXPathValue(node, 'ows:ProviderName');
    this.url = Csw4js.getXPathValue(node, 'ows:ProviderSite/@xlink:href');

    var contact = Csw4js.getXPathNode(node, 'ows:ServiceContact');

    this.contact = {};
    this.contact.name = Csw4js.getXPathValue(contact, 'ows:IndividualName');
    this.contact.position = Csw4js.getXPathValue(contact, 'ows:PositionName');
    this.contact.role = Csw4js.getXPathValue(contact, '/ows:Role');

    var info = Csw4js.getXPathNode(contact, 'ows:ContactInfo');

    this.contact.phone = Csw4js.getXPathValue(info, 'ows:Phone/ows:Voice');
    this.contact.fax = Csw4js.getXPathValue(info, 'ows:Phone/ows:Facsimile');

    this.contact.address = {};
    var address = Csw4js.getXPathNode(info, 'ows:Address');

    this.contact.address.delivery = Csw4js.getXPathValue(address,
        'ows:DeliveryPoint');
    this.contact.address.city = Csw4js.getXPathValue(address,
        'ows:City');
    this.contact.address.adminarea = Csw4js.getXPathValue(address,
        'ows:AdministrativeArea');
    this.contact.address.postalcode = Csw4js.getXPathValue(address,
        'ows:PostalCode');
    this.contact.address.country = Csw4js.getXPathValue(address,
        'ows:Country');
    this.contact.address.email = Csw4js.getXPathValue(address,
        'ows:ElectronicMailAddress');

    this.contact.url = Csw4js.getXPathValue(info,
        'ows:OnlineResource/@xlink:href');
    this.contact.hours = Csw4js.getXPathValue(info, 'ows:HoursOfService');
    this.contact.instructions = Csw4js.getXPathValue(info,
        'ows:ContactInstructions');
};

Csw4js.Ows.OperationsMetadata = function(node) {
    var iter = null;
    var iter2 = null;
    var member = null;
    var member2 = null;
    var operation = null;
    var param = null;
    this.operations = [];
    this.parameters = [];
    this.constraints = [];

    iter = Csw4js.getXPathNodeList(node, 'ows:Operation');
    member = iter.iterateNext();
    while (member) {
        operation = {};
        operation.name = Csw4js.getXPathValue(member, '@name');
        operation.dcp = {'http': {}};
        operation.dcp.http.get = Csw4js.getXPathValue(member,
            'ows:DCP/ows:HTTP/ows:Get/@xlink:href');
        operation.dcp.http.post = Csw4js.getXPathValue(member,
            'ows:DCP/ows:HTTP/ows:Post/@xlink:href');

        operation.parameters = [];

        iter2 = Csw4js.getXPathNodeList(member, 'ows:Parameter');
        member2 = iter2.iterateNext();
        while (member2) {
            param = {};
            param.name = Csw4js.getXPathValue(member2, '@name');
            param.values = Csw4js.getXPathValueList(member2, 'ows:Value');
            operation.parameters.push(param);
            member2 = iter2.iterateNext();
        }

        operation.constraints = [];

        iter2 = Csw4js.getXPathNodeList(member, 'ows:Constraint');
        member2 = iter2.iterateNext();
        while (member2) {
            param = {};
            param.name = Csw4js.getXPathValue(member2, '@name');
            param.values = Csw4js.getXPathValueList(member2, 'ows:Value');
            operation.parameters.push(param);
            member2 = iter2.iterateNext();
        }
        this.operations.push(operation);
        member = iter.iterateNext();
    }

    iter = Csw4js.getXPathNodeList(node, 'ows:Parameter');
    member = iter.iterateNext();
    while (member) {
        param = {};
        param.name = Csw4js.getXPathValue(member, '@name');
        param.values = Csw4js.getXPathValueList(member, 'ows:Value');
        this.parameters.push(param);
        member = iter.iterateNext();
    }
    iter = Csw4js.getXPathNodeList(node, 'ows:Constraint');
    member = iter.iterateNext();
    while (member) {
        param = {};
        param.name = Csw4js.getXPathValue(member, '@name');
        param.values = Csw4js.getXPathValueList(member, 'ows:Value');
        this.constraints.push(param);
        member = iter.iterateNext();
    }

};

Csw4js.Fes.FilterCapabilities = function(node) {
    this.spatials = {};
    this.scalars = {};
    this.ids = {};

    this.spatials.geometries = Csw4js.getXPathValueList(node,
        'ogc:Spatial_Capabilities/ogc:GeometryOperands/ogc:GeometryOperand');
    this.spatials.operators = Csw4js.getXPathValueList(node,
        '//ogc:SpatialOperators/ogc:SpatialOperator/@name');

    this.scalars.comparisons = Csw4js.getXPathValueList(node,
        '//ogc:ComparisonOperators/ogc:ComparisonOperator');

    this.scalars.functions = Csw4js.getXPathValueList(node,
        '//ogc:FunctionNames/ogc:FunctionName');
};

Csw4js.Csw = function(url) {
    // init by doing a GetCapabilities and parsing metadata
    var node = null;
    this.url = url;
    this.version = '2.0.2';

    var params = {
        'service': 'CSW',
        'version': this.version,
        'request': 'GetCapabilities'
    };

    console.log(this.url);
    try {
        try {
            console.debug('Fetching url with params');
            this.xml = Csw4js.loadXMLDoc(
                Csw4js.Util.buildUrl(this.url, params));
        } catch (err2) {
            console.debug('Fetching url with no params (static doc)');
            this.xml = Csw4js.loadXMLDoc(this.url, params);
        }
    } catch(err) {  // string
        console.error(err);
        this.xml = Csw4js.loadXMLString(this.url, params);
    }
    // TODO: error checking, etc.

    // get main sections and parse them (TODO)
    console.debug('Procesing ows:ServiceIdentificaiton');
    node = Csw4js.getXPathNode(this.xml, '//ows:ServiceIdentification');
    this.identification = new Csw4js.Ows.ServiceIdentification(node);

    console.debug('Procesing ows:ServiceProvider');
    node = Csw4js.getXPathNode(this.xml, '//ows:ServiceProvider');
    this.provider = new Csw4js.Ows.ServiceProvider(node);

    console.debug('Procesing ows:OpeartionsMetadata');
    node = Csw4js.getXPathNode(this.xml, '//ows:OperationsMetadata');
    this.operationsmetadata = new Csw4js.Ows.OperationsMetadata(node);

    console.debug('Procesing ogc:Filter_Capabilities');
    node = Csw4js.getXPathNode(this.xml, '//ogc:Filter_Capabilities');
    this.filtercapabilities = new Csw4js.Fes.FilterCapabilities(node);
};

/**
 *
 * Operations List:
 *
 * GetCapabilities
 * Transaction
 * GetRepositoryItem
 * DescribeRecord
 * GetDomain
 * GetRecordById
 * GetRecords
 * Harvest
 *
 * */

/**
 * Operation name: GetRecords
 *
 * */

Csw4js.Csw.prototype.GetRecords = function(esn, resulttype, typename) {
    console.log('Get Records');
    //return 'GetRecords called';
    var params = {
        'service': 'CSW',
        'version': this.version,
        'request': 'GetRecords',
        'outputformat': 'application/xml',
        'outputschema': 'http://www.opengis.net/cat/csw/2.0.2',
        'resulttype' : resulttype || null,
        'typenames' : typename || 'csw:Record',
        'elementsetname': esn || 'full'
    };

    var url = this.getOperationByName('GetRecords').dcp.http.get;
    this.xml = Csw4js.loadXMLDoc(Csw4js.Util.buildUrl(url, params));

    return Csw4js.unmarshaller.unmarshalDocument(this.xml);
};

/**
 * Operation name: GetRecordById
 *
 * */

Csw4js.Csw.prototype.GetRecordById = function(id_list, esn,
                                              outputformat, outputschema) {
    var params = {
        'service': 'CSW',
        'version': this.version,
        'request': 'GetRecordById',
        'outputformat': outputformat || null,
        'outputschema': outputschema || null,
        'elementsetname': esn || null,
        'id': id_list.join(',')
    };

    var url = this.getOperationByName('GetRecordById').dcp.http.get;
    this.xml = Csw4js.loadXMLDoc(Csw4js.Util.buildUrl(url, params));
};

Csw4js.Csw.prototype.getOperationByName = function(name) {
    for(var i = 0; i < this.operationsmetadata.operations.length; i++) {
        var opname = this.operationsmetadata.operations[i].name.toLowerCase();
        if (name.toLowerCase() === opname) {
            return this.operationsmetadata.operations[i];
        }
    }
    return false;
};

/**
 * Util functions
 * */

Csw4js.loadXMLDoc = function(url) {
    var httpRequest;
    try {  // no proxy
        console.debug('no proxy');
        httpRequest = this.Util.httpGet(url);
        console.debug('found no proxy');
        if (httpRequest.status !== 200) {
            throw 'HTTP status code ' + httpRequest.status;
        }
        return httpRequest.responseXML;
    } catch (err) {  // with proxy
        try {
            console.warn(err);
            console.debug('with proxy');
            httpRequest = this.Util.httpGet(Csw4js.Proxy + url);
            console.debug('found with proxy');
            if (httpRequest.status !== 200) {
                throw 'HTTP status code ' + httpRequest.status;
            }
            return httpRequest.responseXML;
        } catch (err2) {
            console.error(err2);
            throw 'Unable to load XML from URL';
        }
    }
};

Csw4js.loadXMLString = function(txt) {
    var parser = null;
    var xmlDoc = null;

    if (Csw4js.NOTIE) {
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(txt, 'text/xml');
    }
    else {
        xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
        xmlDoc.async = false;
        xmlDoc.loadXML(txt);
    }
    return xmlDoc;
};

Csw4js.Util.httpGet = function(url) {
    var httpRequest;
    try {
        try {
            httpRequest = new ActiveXObject('Microsoft.XMLHTTP');
        } catch (e) {
            httpRequest = new XMLHttpRequest();
        }
        httpRequest.open('GET', url, false);
        httpRequest.send(null);
        return httpRequest;
    } catch (e) {
        throw e;
    }
};

Csw4js.Util.httpPost = function(url, lang, request) {
    var httpRequest;
    try {
        try {
            httpRequest = new ActiveXObject('Microsoft.XMLHTTP');
        } catch (e) {
            httpRequest = new XMLHttpRequest();
        }
        httpRequest.open('POST', url, false);
        httpRequest.setRequestHeader('Accept-Language',lang);
        httpRequest.send(request);
        return httpRequest;
    } catch (e) {
        throw(e);
    }
};

Csw4js.Util.buildUrl = function(url, params) {
    var kvps = [];

    for (var key in params) {
        if (params[key] !== null) {
            kvps.push(key+'='+params[key]);
        }
    }

    return url + '?' + kvps.join('&');
};