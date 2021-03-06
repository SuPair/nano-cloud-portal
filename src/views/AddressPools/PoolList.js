import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Skeleton from '@material-ui/lab/Skeleton';
import AddIcon from '@material-ui/icons/Add';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';

// dashboard components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Info from "components/Typography/Info.js";
import Snackbar from "components/Snackbar/Snackbar.js";
import Button from "components/CustomButtons/Button.js";
import OperableTable from "components/Table/OperableTable.js";
import PoolRow from "views/AddressPools/PoolRow.js";
import DeleteDialog from "views/AddressPools/DeleteDialog.js";
import CreateDialog from "views/AddressPools/CreateDialog.js";
import ModifyDialog from "views/AddressPools/ModifyDialog.js";
import { getLoggedSession, logoutSession, redirectToLogin } from 'utils.js';
import { getAllNetworkPools, writeLog } from "nano_api.js";

const styles = {
  cardCategoryWhite: {
    "&,& a,& a:hover,& a:focus": {
      color: "rgba(255,255,255,.62)",
      margin: "0",
      fontSize: "14px",
      marginTop: "0",
      marginBottom: "0"
    },
    "& a,& a:hover,& a:focus": {
      color: "#FFFFFF"
    }
  },
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: "#777",
      fontSize: "65%",
      fontWeight: "400",
      lineHeight: "1"
    }
  }
};

const useStyles = makeStyles(styles);

const i18n = {
  'en':{
    createButton: "Create Address Pool",
    tableTitle: "Address Pools",
    name: "Name",
    gateway: "Gateway",
    address: "Total Address",
    allocated: "Allocated Address",
    operates: "Operates",
    noResource: "No address pool available",
  },
  'cn':{
    createButton: "创建地址池",
    tableTitle: "地址资源池",
    name: "名称",
    gateway: "网关",
    address: "地址数量",
    allocated: "已分配地址",
    operates: "操作",
    noResource: "没有地址池",
  }
}

export default function PoolList(props){
    const classes = useStyles();
    const [ poolList, setPoolList ] = React.useState(null);
    //for dialog
    const [ createDialogVisible, setCreateDialogVisible ] = React.useState(false);
    const [ modifyDialogVisible, setModifyDialogVisible ] = React.useState(false);
    const [ deleteDialogVisible, setDeleteDialogVisible ] = React.useState(false);
    const [ current, setCurrent ] = React.useState('');

    const [ notifyColor, setNotifyColor ] = React.useState('warning');
    const [ notifyMessage, setNotifyMessage ] = React.useState("");

    const closeNotify = () => {
      setNotifyMessage("");
    }

    const showErrorMessage = React.useCallback((msg) => {
      const notifyDuration = 3000;
      setNotifyColor('warning');
      setNotifyMessage(msg);
      setTimeout(closeNotify, notifyDuration);
    }, [setNotifyColor, setNotifyMessage]);

    const reloadAllAddressPools = React.useCallback(() => {
      const onLoadFail = (err) =>{
        showErrorMessage(err);
        logoutSession();
      }
      getAllNetworkPools(setPoolList, onLoadFail);
    }, [showErrorMessage]);

    const showNotifyMessage = (msg) => {
      const notifyDuration = 3000;
      setNotifyColor('info');
      setNotifyMessage(msg);
      writeLog(msg);
      setTimeout(closeNotify, notifyDuration);
    };

    //modify
    const showModifyDialog = (poolName) =>{
      setModifyDialogVisible(true);
      setCurrent(poolName);
    }

    const closeModifyDialog = () =>{
      setModifyDialogVisible(false);
    }

    const onModifySuccess = (poolName) =>{
      closeModifyDialog();
      showNotifyMessage('pool ' + poolName + ' modified');
      reloadAllAddressPools();
    };

    //delete
    const showDeleteDialog = (poolName) =>{
      setDeleteDialogVisible(true);
      setCurrent(poolName);
    }

    const closeDeleteDialog = () =>{
      setDeleteDialogVisible(false);
    }

    const onDeleteSuccess = (poolName) =>{
      closeDeleteDialog();
      showNotifyMessage('pool ' + poolName + ' deleted');
      reloadAllAddressPools();
    };

    //create
    const showCreateDialog = () =>{
      setCreateDialogVisible(true);
    };

    const closeCreateDialog = () =>{
      setCreateDialogVisible(false);
    }

    const onCreateSuccess = (poolName) =>{
      closeCreateDialog();
      showNotifyMessage('pool ' + poolName + ' created');
      reloadAllAddressPools();
    };

    React.useEffect(() =>{
      reloadAllAddressPools();
    }, [reloadAllAddressPools]);


    //reder begin
    var session = getLoggedSession();
    if (null === session){
      return redirectToLogin();
    }
    const { lang } = props;
    const texts = i18n[lang];
    let content;
    if (null === poolList){
      content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
    }else if (0 === poolList.length){
      content = <Info>{texts.noResource}</Info>;
    }else{
      content = (
        <OperableTable
          color="primary"
          headers={[texts.name, texts.gateway, texts.address, texts.allocated, texts.operates]}
          rows={
            poolList.map(pool =>(
              <PoolRow
                key={pool.name}
                pool={pool}
                lang={lang}
                onModify={showModifyDialog}
                onDelete={showDeleteDialog}
                />
            ))}
          />
      );
    }

    return (
      <GridContainer>
        <GridItem xs={12}>
          <Box mt={3} mb={3}>
          <Divider/>
          </Box>
        </GridItem>
        <GridItem xs={12} sm={12} md={12}>
          <GridContainer>
            <GridItem xs={3} sm={3} md={3}>
              <Button size="sm" color="info" round onClick={showCreateDialog}><AddIcon />{texts.createButton}</Button>
            </GridItem>
          </GridContainer>
        </GridItem>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="primary">
              <h4 className={classes.cardTitleWhite}>{texts.tableTitle}</h4>
            </CardHeader>
            <CardBody>
              {content}
            </CardBody>
          </Card>
        </GridItem>
        <GridItem>
          <Snackbar
            place="tr"
            color={notifyColor}
            message={notifyMessage}
            open={"" !== notifyMessage}
            closeNotification={closeNotify}
            close
          />
        </GridItem>
        <GridItem>
          <CreateDialog
            lang={lang}
            open={createDialogVisible}
            onSuccess={onCreateSuccess}
            onCancel={closeCreateDialog}
            />
        </GridItem>
        <GridItem>
          <ModifyDialog
            lang={lang}
            open={modifyDialogVisible}
            pool={current}
            onSuccess={onModifySuccess}
            onCancel={closeModifyDialog}
            />
        </GridItem>
        <GridItem>
          <DeleteDialog
            lang={lang}
            open={deleteDialogVisible}
            pool={current}
            onSuccess={onDeleteSuccess}
            onCancel={closeDeleteDialog}
            />
        </GridItem>
      </GridContainer>
    );
}
