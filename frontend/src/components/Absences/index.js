import React, { useEffect, useState, useCallback } from "react";
import { Row, Col, Table } from "react-bootstrap";
import { connect } from "react-redux";
import ReactPaginate from "react-paginate";

//Actions
import actions from "../../redux/actions";

//Styled Components
import PaginationWrapper from "../styled/PaginationWrapper";

//Components
import TableRow from "../TableRow";
import TableHeader from "../TableHeader";
import CustomModal from "../CustomModal";
import AbsenceDetail from "../AbsenceDetail";
import Filters from "../Filters";

import { handleMessage } from "../../handlers";

const Absences = (props) => {
  const { absences = [], loading = false, total = 0, error = false } = props;
  const count = Math.ceil(total / 10);

  const [state, setState] = useState({
    limit: 10,
    page: 1,
    status: "",
    startDate: null,
    endDate: null,
    showModal: false,
    selectedAbsence: null,
  });

  const getAbsences = useCallback(() => {
    const { limit, page, status } = state;

    return actions.getAbsences({
      limit,
      page,
      status,
      startDate: state.startDate ? state.startDate.getTime() : "",
      endDate: state.endDate ? state.endDate.getTime() : "",
    });
  }, [state]);

  useEffect(() => {
    getAbsences();
  }, [state, getAbsences]);

  const handlePaginationClick = ({ selected }) => {
    setState({
      ...state,
      page: selected + 1,
    });
  };

  const toggleModal = (showModal, selectedAbsence) => {
    setState({
      ...state,
      showModal,
      selectedAbsence,
    });
  };

  const changeStatus = (status) => {
    setState({
      ...state,
      status,
    });
  };

  const changeDates = (startDate, endDate) => {
    setState({
      ...state,
      startDate,
      endDate,
    });
  };

  const downloadFile = (id) => {
    actions.downloadIcalFile(id).then((res) => {
      const href = window.URL.createObjectURL(res);
      const a = document.createElement("a");
      a.download = "event.ics";
      a.href = href;
      a.click();
      a.href = "";
    });
  };

  const tableHeaders = [
    "Sr. No.",
    "Member name",
    "Type of absence",
    "Period",
    "Member note",
    "Status",
    "Admitter note",
    "Actions",
  ];

  return (
    <Row data-testid="absences">
      <Col xs={12} lg={12}>
        <Filters
          total={total}
          changeStatus={changeStatus}
          changeDates={changeDates}
        />
        <Row>
          <Col xs={12} lg={12} className="table-responsive">
            <Table>
              <thead>
                <TableHeader data={tableHeaders} />
              </thead>
              <tbody>
                {absences.length ? (
                  absences.map((absence, key) => (
                    <TableRow
                      key={absence.id}
                      index={(state.page - 1) * state.limit + (key + 1)}
                      {...absence}
                      toggleModal={() => toggleModal(true, absence)}
                      downloadFile={downloadFile}
                    />
                  ))
                ) : (
                  <TableRow
                    noData
                    text={handleMessage(loading, error, !absences.length)}
                  />
                )}
              </tbody>
            </Table>
          </Col>
        </Row>
        {!!absences.length && (
          <Row>
            <Col xs={12} lg={12}>
              <PaginationWrapper data-testid="pagination">
                <ReactPaginate
                  previousLabel="Previous"
                  nextLabel={"Next"}
                  breakLabel={"..."}
                  pageCount={count}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={5}
                  onPageChange={handlePaginationClick}
                  containerClassName="pagination float-right"
                  pageLinkClassName="page-link"
                  pageClassName="page-item"
                  activeClassName="active"
                  previousClassName="page-item"
                  nextClassName="page-item"
                  breakClassName="page-link"
                  nextLinkClassName="page-link"
                  previousLinkClassName="page-link"
                  disabledClassName="disabled"
                />
              </PaginationWrapper>
            </Col>
          </Row>
        )}
      </Col>
      <CustomModal
        showModal={state.showModal}
        toggleModal={toggleModal}
        title="Details of absence"
      >
        <AbsenceDetail {...state.selectedAbsence} />
      </CustomModal>
    </Row>
  );
};

const mapStateToProps = (state) => {
  return {
    absences: state.absences.absences,
    loading: state.absences.loading,
    total: state.absences.total,
    error: state.absences.error,
  };
};

export default connect(mapStateToProps)(Absences);
