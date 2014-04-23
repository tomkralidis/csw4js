
var Csw4js = {};

Csw4js.version = '0.0.1';

Csw4js.Namespaces = {
    'csw202': 'http://www.opengis.net/cat/csw/2.0.2',
    'fes110': 'http://www.opengis.net/ogc',
    'ows100': 'http://www.opengis.net/ows'
};

Csw4js.Csw = function(url) {
    // init by doing a GetCapabilities and parsing metadata
    this.url = url;
    this.version = '2.0.2';

    this.xml = Csw4js.loadXMLDoc(url);
    // error checking, etc.

    // get main sections and parse them (TODO)
    this.identification = this.xml.getElementsByTagNameNS(Csw4js.Namespaces.ows100, 'ServiceIdentification');
    this.provider = this.xml.getElementsByTagNameNS(Csw4js.Namespaces.ows100, 'ServiceProvider')[0];
    this.operations = this.xml.getElementsByTagNameNS(Csw4js.Namespaces.ows100, 'OperationMetadata')[0];
    this.filter_capabilities = this.xml.getElementsByTagNameNS(Csw4js.Namespaces.fes110, 'FilterCapabilities')[0];
};

Csw4js.Csw.prototype.GetRecords = function() {
    return 'GetRecords called';
};

// util functions

Csw4js.loadXMLDoc = function(filename) {
    var xhttp = null;
    if (window.XMLHttpRequest) {
        xhttp = new XMLHttpRequest();
    }
    else { // code for IE5 and IE6
        xhttp = new ActiveXObject('Microsoft.XMLHTTP');
    }
    xhttp.open('GET',filename,false);
    xhttp.send();
    return xhttp.responseXML;
};

Csw4js.loadXMLString = function(txt) {
    var parser = null;
    var xmlDoc = null;

    if (window.DOMParser) {
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(txt, 'text/xml');
    }
    else { // code for IE
        xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
        xmlDoc.async = false;
        xmlDoc.loadXML(txt);
    }
    return xmlDoc;
};
