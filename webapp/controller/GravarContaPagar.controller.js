sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"idxtec/lib/fragment/ParceiroNegocioHelpDialog",
	"idxtec/lib/fragment/CentroCustoHelpDialog",
	"idxtec/lib/fragment/ContaContabilHelpDialog"
], function(Controller, History, MessageBox, JSONModel, ParceiroNegocioHelpDialog,
	CentroCustoHelpDialog, ContaContabilHelpDialog) {
	"use strict";

	return Controller.extend("br.com.idxtecContaPagar.controller.GravarContaPagar", {
		onInit: function(){
			var oRouter = this.getOwnerComponent().getRouter();
			
			oRouter.getRoute("gravarcontapg").attachMatched(this._routerMatch, this);
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			
			this._operacao = null;
			this._sPath = null;
			
			var oJSONModel = new JSONModel();
			this.getOwnerComponent().setModel(oJSONModel,"model");
		},
		
		getModel : function(sModel) {
			return this.getOwnerComponent().getModel(sModel);	
		},
		
		parceiroNegocioReceived: function() {
			this.getView().byId("parceironegocio").setSelectedKey(this.getModel("model").getProperty("/ParceiroNegocio"));
		},
		
		centroCustoReceived: function() {
			this.getView().byId("centrocusto").setSelectedKey(this.getModel("model").getProperty("/CentroCusto"));
		},
		
		contaContabilReceived: function() {
			this.getView().byId("contacontabil").setSelectedKey(this.getModel("model").getProperty("/PlanoConta"));
		},
		
		handleSearchParceiro: function(oEvent){
			var oHelp = new ParceiroNegocioHelpDialog(this.getView(), "parceironegocio");
			oHelp.getDialog().open();
		},
		
		handleSearchCentroCusto: function(oEvent){
			var oHelp = new CentroCustoHelpDialog(this.getView(), "centrocusto");
			oHelp.getDialog().open();
		},
		
		handleSearchContaContabil: function(oEvent){
			var oHelp = new ContaContabilHelpDialog(this.getView(), "contacontabil");
			oHelp.getDialog().open();
		},
		
		_routerMatch: function(){
			var oParam = this.getOwnerComponent().getModel("parametros").getData();
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getOwnerComponent().getModel("view");
			
			this._operacao = oParam.operacao;
			this._sPath = oParam.sPath;
			
			this.getView().byId("parceironegocio").setValue(null);
			this.getView().byId("centrocusto").setValue(null);
			this.getView().byId("contacontabil").setValue(null);
			
			if (this._operacao === "incluir"){
				
				oViewModel.setData({
					titulo: "Inserir Conta a Pagar"
				});
			
				var oNovoContaPagar = {
					"Id": 0,
					"Titulo": "",
					"TipoTitulo": "",
					"Valor": 0.00,
					"Acrescimo": 0.00,
					"Desconto": 0.00,
					"Emissao": null,
					"Vencimento": null,
					"Total": 0.00,
					"Saldo": 0.00,
					"ParceiroNegocio": 0,
					"CentroCusto": 0,
					"ContaContabil": "",
					"Historico": ""
				};
				
				oJSONModel.setData(oNovoContaPagar);
				
			} else if (this._operacao === "editar"){
				
				oViewModel.setData({
					titulo: "Editar Conta a Pagar"
				});
				
				oModel.read(oParam.sPath,{
					success: function(oData) {
						oJSONModel.setData(oData);
					},
					error: function(oError) {
						MessageBox.error(oError.responseText);
					}
				});
			}
		},
		
		onSalvar: function(){
			if (this._checarCampos(this.getView())) {
				MessageBox.warning("Preencha todos os campos obrigatórios!");
				return;
			}
			
			if (this._operacao === "incluir") {
				this._createConta();
			} else if (this._operacao === "editar") {
				this._updateConta();
			}
		},
		
		_goBack: function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			
			if (sPreviousHash !== undefined) {
					window.history.go(-1);
			} else {
				oRouter.navTo("contapagar", {}, true);
			}
		},
		
		_getDados: function(){
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oDados = oJSONModel.getData();
			
			oDados.ParceiroNegocio = oDados.ParceiroNegocio ? parseInt(oDados.ParceiroNegocio, 0) : 0;
			oDados.CentroCusto = oDados.CentroCusto ? parseInt(oDados.CentroCusto, 0) : 0;
		
			oDados.TipoTituloDetails = {
				__metadata: {
					uri: "/TipoTitulos('" + oDados.TipoTitulo + "')"
				}
			};
			
			oDados.ParceiroNegocioDetails = {
				__metadata: {
					uri: "/ParceiroNegocios(" + oDados.ParceiroNegocio + ")"
				}
			};
			
			oDados.CentroCustoDetails = {
				__metadata: {
					uri: "/CentroCustos(" + oDados.CentroCusto + ")"
				}
			};
			
			oDados.PlanoContaDetails = {
				__metadata: {
					uri: "/PlanoContas('" + oDados.ContaContabil + "')"
				}
			};

			return oDados;
		},
		
		_createConta: function() {
			var oModel = this.getOwnerComponent().getModel();
			var that = this;

			oModel.create("/ContaPagars", this._getDados(), {
				success: function() {
					MessageBox.success("Conta a pagar inserida com sucesso!", {
						onClose: function(){
							that._goBack(); 
						}
					});
				},
				error: function(oError) {
					MessageBox.error(oError.responseText);
				}
			});
		},
		
		_updateConta: function() {
			var oModel = this.getOwnerComponent().getModel();
			var that = this;
			
			oModel.update(this._sPath, this._getDados(), {
					success: function() {
					MessageBox.success("Conta a pagar inserida com sucesso!", {
						onClose: function(){
							that._goBack();
						}
					});
				},
				error: function(oError) {
					MessageBox.error(oError.responseText);
				}
			});
		},
		
		_checarCampos: function(oView){
			if(oView.byId("titulo").getValue() === "" || oView.byId("tipotitulo").getSelectedItem() === null
			|| oView.byId("valor").getValue() === ""){
				return true;
			} else{
				return false; 
			}
		},
		
		onVoltar: function(){
			this._goBack();
		}
	});
});