import React, { useState, useEffect, useContext } from "react";
// Internal imports
import {
    CompleteShipment,
    Form,
    GetShipment,
    Profile,
    Services,
    StartShipment,
    Table
} from "../Components/index";
import { TrackingContext } from "@/Context/Tracking";

const index = () => {
  const {
    currentUser,
    createShipment,
    getAllShimpents,
    CompleteShipment,
    getShipment,
    StartShipment,
    getShipmentCount
  } = useContext(TrackingContext);

  const [createShimentModel, setCreateShipmentModel] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [startModal, setStartModal] = useState(false);
  const [completeModal, setCompleteModal] = useState(false);
  const [getModel, setGetModel] = useState(false);

  const [allShipmentsData, setAllShipmentsData] = useState();

  useEffect(() => {

    const getCampignsData = getAllShimpents();

    return async () => {
      const allData = await getCampignsData;
      setAllShipmentsData(allData);
    };
  },[]);

  return (
    <>
    <Services 
    setOpenProfile={setOpenProfile}
    setGetModel={setGetModel}
    setStartModal={setStartModal}
    setCompleteModal={setCompleteModal} />

    <Table
    setCreateShipmentModel={setCreateShipmentModel}
    allShipmentsData={allShipmentsData} />

    <Form
    createShimentModel={createShimentModel}
    createShipment={createShipment}
    setCreateShipmentModel={setCreateShipmentModel} />

    <Profile
    openProfile={openProfile}
    setOpenProfile={setOpenProfile}
    currentUser={currentUser} 
    getShipmentCount={getShipmentCount} />

    <CompleteShipment
    completeModal={completeModal}
    setCompleteModal={setCompleteModal}
    CompleteShipment={CompleteShipment} />

    <GetShipment
    getModel={getModel}
    setGetModel={setGetModel}
    getShipment={getShipment} />

    <StartShipment
    startModal={startModal}
    setStartModal={setStartModal}
    StartShipment={StartShipment} />

    </>
  );

};

export default index;