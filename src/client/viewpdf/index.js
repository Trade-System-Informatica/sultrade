import React, { Component} from 'react'
import { Document, Page, pdfjs } from "react-pdf"

class ViewPdf extends Component {
    
    state = {
        arquivo: '',
        file: [],
        numPages: 0,
        pageNumber: 1
    }

    componentDidMount = async () => {
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`
        await this.setState({file: this.props.location.state.document})
        await this.setState({arquivo: `http://rgfumigacao.com.br/api/documents/${this.state.file.link}.pdf`})
        console.log(this.state.arquivo)
    }

    onDocumentLoadSuccess = async (pages) => {
        await this.setState({numPages: pages})
    }

    onDocumentLoadError = (error) => {
        console.error(error)
    }
    
    render(){
        return (
            <div>
                <Document
                    file={this.state.arquivo}
                    onLoadSuccess={() => this.onDocumentLoadSuccess()}
                    onLoadError={(error) => this.onDocumentLoadError(error)}
                >
                    <Page pageNumber={this.state.pageNumber} />
                </Document>
                <p>Page {this.state.pageNumber} of {this.state.numPages}</p>
            </div>
        )
    }
}
/*

function ViewPdf() {
  
  const location = useLocation()
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [document, setDocument] = useState(`http://rgfumigacao.com.br/api/documents/${location.state.document.link}.pdf`)
  

  useEffect(() => {
    console.log(document)
  }, [document])


  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages)
  }

  return (
    <div>
      <Document
        file= "http://rgfumigacao.com.br/api/documents/20210210150931.pdf"
        onLoadSuccess={onDocumentLoadSuccess}
      >
        <Page pageNumber={pageNumber} />
      </Document>
      <p>Page {pageNumber} of {numPages}</p>
    </div>
  )

}
*/
export default ViewPdf
