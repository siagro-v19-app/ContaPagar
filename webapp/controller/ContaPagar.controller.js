sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"br/com/idxtecContaPagar/services/Session"
], function(Controller, MessageBox, Filter, FilterOperator, JSONModel, Session) {
	"use strict";

	return Controller.extend("br.com.idxtecContaPagar.controller.ContaPagar", {
		onInit: function(){
			var oParamModel = new JSONModel();
			
			this.getOwnerComponent().setModel(oParamModel, "parametros");
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			
			var oFilter = new Filter("Empresa", FilterOperator.EQ, Session.get("EMPRESA_ID"));
			var oView = this.getView();
			var oTable = oView.byId("tableContaPagar");
			
			oTable.bindRows({ 
				path: '/ContaPagars',
					sorter: {
						path: 'Titulo'
				},
				parameters: {
					expand: 'CentroCustoDetails,TipoTituloDetails,ParceiroNegocioDetails,PlanoContaDetails'
				},
				filters: oFilter
			});
		},
		
		filtraConta: function(oEvent){
			var sQuery = oEvent.getParameter("query").toUpperCase();
			var oFilter1 = new Filter("Empresa", FilterOperator.EQ, Session.get("EMPRESA_ID"));
			var oFilter2 = new Filter("Titulo", FilterOperator.Contains, sQuery);
			
			var aFilters = [
				oFilter1,
				oFilter2
			];

			this.getView().byId("tableContaPagar").getBinding("rows").filter(aFilters, "Application");
		},

		onRefresh: function(e){
			var oModel = this.getOwnerComponent().getModel();
			oModel.refresh(true);
			this.getView().byId("tableContaPagar").clearSelection();
		},
		
		onIncluir: function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oTable = this.byId("tableContaPagar"); 
			
			var oParModel = this.getOwnerComponent().getModel("parametros");
			oParModel.setData({operacao: "incluir"});
			
			oRouter.navTo("gravarcontapg");
			oTable.clearSelection();
		},
		
		onEditar: function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oTable = this.byId("tableContaPagar");
			var nIndex = oTable.getSelectedIndex();
			
			if (nIndex === -1){
				MessageBox.warning("Selecione uma conta a pagar na tabela.");
				return;
			}
			
			var sPath = oTable.getContextByIndex(nIndex).sPath;
			var oParModel = this.getOwnerComponent().getModel("parametros");
			oParModel.setData({sPath: sPath, operacao: "editar"});
			
			oRouter.navTo("gravarcontapg");
			oTable.clearSelection();
		},
		
		onRemover: function(e){
			var that = this;
			var oTable = this.byId("tableContaPagar");
			var nIndex = oTable.getSelectedIndex();
			
			if (nIndex === -1){
				MessageBox.warning("Selecione uma conta a pagar na tabela.");
				return;
			}
			
			MessageBox.confirm("Deseja remover esta conta?", {
				onClose: function(sResposta){
					if(sResposta === "OK"){
						that._remover(oTable, nIndex);
						MessageBox.success("Conta a pagar removido com sucesso!");
					}
				}
			});
		},
		
		_remover: function(oTable, nIndex){
			var oModel = this.getOwnerComponent().getModel();
			var oContext = oTable.getContextByIndex(nIndex);
			
			oModel.remove(oContext.sPath, {
				success: function(){
					oModel.refresh(true);
					oTable.clearSelection();
				},
				error: function(oError){
					MessageBox.error(oError.responseText);
				}
			});
		},
		
		getModel: function(){
			return this.getOwnerComponent().getModel();
		}
	});
});