import React, { Component } from 'react'
import './styles.css'

import { Link, Redirect } from 'react-router-dom'
import { faTrashAlt, faPen, faPlus, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'

import moment from 'moment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const minColSize = 50;

class TableList extends Component {
    render() {

        return (
            <div className="tableList_Wrapper">
            <div className="tableList_Main">
                <div className="tableList_Header">
                    {this.props.items.map((item) => (
                        <div style={{ overflowWrap: 'ellipsis', minWidth: minColSize * item.size }}>
                            <span className="subtituloships">{item.title}</span>
                        </div>
                    ))}
                    <div className="col-2 text-center revertItem" style={{ minWidth: 100, maxWidth: 100 }} onClick={() => { if (this.props.list[0]) { this.props.revertFunction() } }}>
                        {!this.props.list[0] && this.props.permissions.add &&
                            <span className="subtituloships"><Link to={this.props.addLink()}><FontAwesomeIcon icon={faPlus} /></Link></span>
                        }
                        {this.props.list[0] &&
                            <span className="subtituloships"><FontAwesomeIcon icon={this.props.direction} /></span>
                        }
                    </div>
                </div>

                {this.props.list[0] != undefined && this.props.list.map((item, index) => (
                    <div style={{width: 100 + this.props.items.map((it) => it.size * minColSize).reduce((a, b) => a + b)}} ref={item[this.props.items.find((it) => it.type == "key")?.field] == this.props.focus ? "focusMe" : ""} tabindex={-1} className={`${index % 2 == 0 ? item[this.props.items.find((it) => it.type == "key")?.field] == this.props.focus ? "par focusLight" : "par " : item[this.props.items.find((it) => it.type == "key")?.field] == this.props.focus ? "impar focusDark" : "impar"}`}>
                        <div className="tableList_Body">
                            {this.props.items.map((it) => (
                                <div style={{ overflowWrap: 'ellipsis', minWidth: minColSize * it.size }}>
                                    {(it.type == "text" || it.type == "key" || it.type == "title") &&
                                        <p>{item[it.field]}</p>
                                    }
                                    {it.type == "date" &&
                                        <p>{moment(item[it.field]).format("DD/MM/YYYY")}</p>
                                    }
                                    {it.type == "money" &&
                                        <p>{it.moneySymbol}{new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item[it.field])}</p>
                                    }
                                </div>
                            ))}
                            <div style={{ minWidth: 100 }} className="text-left icones">
                                <div className='iconelixo giveMargin' type='button' >
                                    <Link to={this.props.addLink()}>
                                        <FontAwesomeIcon icon={faPlus} />
                                    </Link>
                                </div>


                                <div className='iconelixo giveMargin' type='button' >
                                    <Link to={this.props.editLink(index)}>
                                        <FontAwesomeIcon icon={faPen} />
                                    </Link>
                                </div>

                                {this.props.permissions.delete &&
                                    <div type='button' className='iconelixo' onClick={() => this.props.deleteFunction(item[this.props.items.find((it) => it.type == "key").field], item[this.props.items.find((it) => it.type == "title").field])} >
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                    </div>
                                }
                            </div>

                        </div>
                    </div>
                ))}
            </div>
            </div>
        )
    }
}

export default TableList;