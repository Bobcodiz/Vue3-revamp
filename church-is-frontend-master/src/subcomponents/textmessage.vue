<!-- updated vue 3 code -->

<!-- Child.vue -->
<template>
    <div>
        <!-- Modal text people -->
        <div class="modal fade" id="textModalCenter" tabindex="-1" role="dialog" aria-labelledby="smsModal" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title text-capitalize">send message to selected members</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="closeSmsModal">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                            <div class="form-group" v-if="sms_status.length === 0">
                                <label class="anvil-checkbox" v-if="context">
                                    <input multiple type="checkbox" :value="true" v-model="custom_message">
                                    <span class="anvil-checkmark"></span>
                                    <span class="ml-5">custom message</span>
                                </label>
                                <hr v-if="context">
                                <label for="exampleFormControlTextarea1">
                                    message {{ memberIds.length }} members
                                    <span class="mt-2 ml-2 small text-muted"
                                        v-if="sms_credit_balance"
                                        style="transition: ease-out;">
                                        {{ sms_credit_balance }} left to spend.
                                    </span>
                                </label>
                                <!-- text message -->
                                <textarea type="text" class="form-control" placeholder="type text message"
                                    v-model="message" @focus="getSMSCreditBalance(); showChangeButton()" rows="3">
                                </textarea>
                                <div class="p-1 d-flex justify-content-end" v-if="show_change_button">
                                    <button class="btn btn-sm btn-success" @click="setDefaultMessage">set as default</button>
                                </div>
                                <p class="mt-2 ml-2 small text-muted">
                                    <span class="font-weight-bold">{{ numberOfMessages }}</span> messages | a message is 160 characters long
                                </p>
                                <p class="mt-2 ml-2 small text-muted" v-if="custom_message">
                                    [name] ---- will be replaced by the member's name.<br/>
                                    [amount] ---- will be replaced by the most recent recorded amount.<br/>
                                    [date] ---- will be replaced by the date <br>
                                    [type] ---- will be replaced by type of envelope
                                </p>
                            </div>
                            <div v-if="sms_status.length > 0" class="text-center">
                                <p class="text-success">Successful</p>
                                <p class="text-info"> The members will receive your message.</p>
                                <p>Check SMS outbox later as it may take a while.</p>
                            </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeSmsModal" data-dismiss="modal">Close</button>
                        <span v-if="sms_status.length === 0">
                            <button type="button" class="btn btn-success" @click="sendMessage">
                                send text
                                <span v-if="sending_message" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            </button>
                        </span>
                    </div>
                    </div>
                </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'textmessage',
    data() {
        return {
            church_detail: JSON.parse(localStorage.getItem('church_details')),
            message: '',
            default_message: "dear [name].\nwe have received your [type] of shillings [amount], on [date], thank you and God bless.",
            numberOfMessages: 0,
            show_change_button: false,
            sms_status: [],
            sending_message: false,
            sms_credit_balance: null,
            custom_message: false,
        };
    },
    props: {
        memberIds: null,
        context: null,
    },
    watch: {
        custom_message(newVal) {
            if (this.context && newVal) {
                if ('default_message' in localStorage) {
                    this.message = localStorage.getItem('default_message');
                } else {
                    this.message = this.default_message;
                }
            }
            if (!newVal) {
                this.message = '';
            }
        },
        message(newVal) {
            if (newVal.length) {
                if (this.church_detail) {
                    // Subtract length of the URL that will go at the bottom of the message
                    var url = this.church_detail[0].domain_url;
                    var message_length = 160 - url.length; // 160 chars is one message
                    this.numberOfMessages = Math.floor(newVal.length / message_length) + 1;
                } else {
                    // Assume the URL will be 30 chars long
                    this.numberOfMessages = Math.floor(newVal.length / 130) + 1;
                }
            } else {
                this.numberOfMessages = 0;
            }
        }
    },
    methods: {
        emitToParent(event) {
            this.$emit('messageSet', this.message);
        },
        showChangeButton() {
            if (this.custom_message) {
                this.show_change_button = true;
            }
        },
        setDefaultMessage() {
            localStorage.setItem('default_message', this.message);
            this.show_change_button = false;
        },
        // Church SMS balance
        getSMSCreditBalance() {
            this.$http.get(this.$BASE_URL + '/api/sms/sms-credit-balance')
                .then((response) => {
                    this.sms_credit_balance = response.data.UserData.balance;
                });
        },
        // Send message
        sendMessage() {
            let context = null;
            if (this.context && this.custom_message) {
                context = this.context.type ? "Offering" : this.context.name;
            }
            this.sending_message = true;
            let url = this.$BASE_URL + '/api/sms/add-sms/';
            if (this.custom_message) {
                url = this.$BASE_URL + '/api/sms/add-custom-sms/';
            }
            this.$http({
                method: 'post',
                url: url,
                data: {
                    sending_member_id: this.$session.get('member_id'),
                    app: "CHURCH",
                    message: this.message,
                    website: true,
                    receipient_member_ids: this.memberIds,
                    context: context
                }
            }).then(response => {
                this.sms_status.push(response);
                this.sending_message = false;
            }).catch(err => {
                this.sms_status.push(err);
                this.sending_message = false;
            });
        },
        closeSmsModal() {
            this.custom_message = false;
            this.sms_status = [];
            this.message = "";
        },
    }
};
</script>
