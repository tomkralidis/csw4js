
NS_OWS = 'http://www.opengis.net/ows';
NS_OGC = 'http://www.opengis.net/ogc';

function Csw(url) {
    // init by doing a GetCapabilities and parsing metadata
    this.url = url;
    this.version = '2.0.2';

    this.xml = loadXMLDoc(url);
    // error checking, etc.

    // get main sections and parse them (TODO)
    this.identification = this.xml.getElementsByTagNameNS(NS_OWS, 'ServiceIdentification')[0];
    this.provider = this.xml.getElementsByTagNameNS(NS_OWS, 'ServiceProvider')[0];
    this.operations = this.xml.getElementsByTagNameNS(NS_OWS, 'OperationMetadata')[0];
    this.filter_capabilities = this.xml.getElementsByTagNameNS(NS_OGC, 'FilterCapabilities')[0];

    this.DescribeRecord = function() {
    }

    this.GetRecords = function() {
    }

    this.GetRecordById = function() {
    }
}
