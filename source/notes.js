enyo.kind({
    name: "biblez.notes",
    kind: "enyo.FittableRows",
    classes: "enyo-fit",
    events: {
        onBack: "",
        onChange: ""
    },
    published: {
        osisRef: null,
        noteId: null,
        noteText: ""
    },
    components: [
        {name: "messagePopup", kind: "onyx.Popup", scrim: true, centered: true, floating: true, classes: "message-popup"},
        {kind: "onyx.Toolbar", components: [
            {kind: "onyx.IconButton", src: "assets/back.png", ontap: "handleBack"},
            {name: "label", content: $L("Notes")}
        ]},
        {kind: "enyo.Scroller", fit: true, style: "text-align: center;", components: [
            {kind: "onyx.InputDecorator", style: "margin: 10px;", alwaysLooksFocused: true, components: [
                {name: "noteInput", kind: "onyx.RichText", classes: "note-input", placeholder: "Enter your note here", allowHmtl: false, oninput: "handleInput"}
            ]},
            {tag: "br"},
            {name: "btDelete", kind: "onyx.Button", content: $L("Delete Note"), disabled: true, classes: "onyx-negative", style: "margin: 10px;", ontap: "removeNote"}
        ]}
    ],

    rendered: function () {
        this.inherited(arguments);
        this.$.noteInput.applyStyle("width", !enyo.Panels.isScreenNarrow() ? 420 + "px" : window.innerWidth-40 + "px");
    },

    setFocus: function () {
        //this.$.noteInput.focus();
    },

    osisRefChanged: function (inSender, inEvent) {
        this.$.noteInput.setValue("");
        this.$.label.setContent($L("Notes for") + " " + api.formatOsis(this.osisRef));
    },

    noteIdChanged: function () {
        if (this.noteId !== null) {
            api.getNote(this.noteId, enyo.bind(this, function (inError, inNote) {
                if(!inError) {
                    this.$.noteInput.setValue(inNote.text);
                    this.$.btDelete.setDisabled(false);
                } else
                    this.handleError(inError);
            }));
        } else {
            this.$.btDelete.setDisabled(true);
        }
    },

    handleInput: function (inSender, inEvent) {
        //enyo.job(this.id + ":update", this.bindSafely("updateNote", inSender.getValue()), 200);
        return true;
    },

    updateNote: function (inSender, inEvent) {
        api.putNote({id: this.noteId, text: this.$.noteInput.getValue().replace(/"/g, '&quot;'), osisRef: this.osisRef}, enyo.bind(this, function (inError, inId) {
            if(!inError) {
                this.doChange({action: "update", osisRef: this.osisRef});
                this.doBack();
            } else
                console.log(inError);
        }));
    },

    removeNote: function () {
        api.removeNote({id: this.noteId, osisRef: this.osisRef}, enyo.bind(this, function (inError) {
            if(!inError) {
                this.doChange({action: "remove", osisRef: this.osisRef});
                this.doBack();
            } else
                this.handleError(inError);
        }));
    },

    handleBack: function() {
        if(this.$.noteInput.getValue() !== "") {
            this.updateNote();
            this.$.noteInput.setValue(" ");
        } else
            this.doBack();
        return true;
    },

    handleError: function (inMessage) {
        if (inMessage.message)
            inMessage = inMessage.message;
        this.$.messagePopup.setContent(inMessage);
        this.$.messagePopup.show();
        return true;
    }
});