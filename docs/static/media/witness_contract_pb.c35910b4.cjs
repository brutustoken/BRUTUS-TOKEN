var jspb=require("@tronweb3/google-protobuf"),goog=jspb,global="undefined"!==typeof globalThis&&globalThis||"undefined"!==typeof window&&window||"undefined"!==typeof global&&global||"undefined"!==typeof self&&self||function(){return this}.call(null)||Function("return this")();goog.exportSymbol("TronWebProto.VoteWitnessContract",null,global),goog.exportSymbol("TronWebProto.VoteWitnessContract.Vote",null,global),goog.exportSymbol("TronWebProto.WitnessCreateContract",null,global),goog.exportSymbol("TronWebProto.WitnessUpdateContract",null,global),TronWebProto.WitnessCreateContract=function(e){jspb.Message.initialize(this,e,0,-1,null,null)},goog.inherits(TronWebProto.WitnessCreateContract,jspb.Message),goog.DEBUG&&!COMPILED&&(TronWebProto.WitnessCreateContract.displayName="TronWebProto.WitnessCreateContract"),TronWebProto.WitnessUpdateContract=function(e){jspb.Message.initialize(this,e,0,-1,null,null)},goog.inherits(TronWebProto.WitnessUpdateContract,jspb.Message),goog.DEBUG&&!COMPILED&&(TronWebProto.WitnessUpdateContract.displayName="TronWebProto.WitnessUpdateContract"),TronWebProto.VoteWitnessContract=function(e){jspb.Message.initialize(this,e,0,-1,TronWebProto.VoteWitnessContract.repeatedFields_,null)},goog.inherits(TronWebProto.VoteWitnessContract,jspb.Message),goog.DEBUG&&!COMPILED&&(TronWebProto.VoteWitnessContract.displayName="TronWebProto.VoteWitnessContract"),TronWebProto.VoteWitnessContract.Vote=function(e){jspb.Message.initialize(this,e,0,-1,null,null)},goog.inherits(TronWebProto.VoteWitnessContract.Vote,jspb.Message),goog.DEBUG&&!COMPILED&&(TronWebProto.VoteWitnessContract.Vote.displayName="TronWebProto.VoteWitnessContract.Vote"),jspb.Message.GENERATE_TO_OBJECT&&(TronWebProto.WitnessCreateContract.prototype.toObject=function(e){return TronWebProto.WitnessCreateContract.toObject(e,this)},TronWebProto.WitnessCreateContract.toObject=function(e,t){var o={ownerAddress:t.getOwnerAddress_asB64(),url:t.getUrl_asB64()};return e&&(o.$jspbMessageInstance=t),o}),TronWebProto.WitnessCreateContract.deserializeBinary=function(e){var t=new jspb.BinaryReader(e),o=new TronWebProto.WitnessCreateContract;return TronWebProto.WitnessCreateContract.deserializeBinaryFromReader(o,t)},TronWebProto.WitnessCreateContract.deserializeBinaryFromReader=function(e,t){for(;t.nextField()&&!t.isEndGroup();){switch(t.getFieldNumber()){case 1:var o=t.readBytes();e.setOwnerAddress(o);break;case 2:o=t.readBytes();e.setUrl(o);break;default:t.skipField()}}return e},TronWebProto.WitnessCreateContract.prototype.serializeBinary=function(){var e=new jspb.BinaryWriter;return TronWebProto.WitnessCreateContract.serializeBinaryToWriter(this,e),e.getResultBuffer()},TronWebProto.WitnessCreateContract.serializeBinaryToWriter=function(e,t){var o=void 0;(o=e.getOwnerAddress_asU8()).length>0&&t.writeBytes(1,o),(o=e.getUrl_asU8()).length>0&&t.writeBytes(2,o)},TronWebProto.WitnessCreateContract.prototype.getOwnerAddress=function(){return jspb.Message.getFieldWithDefault(this,1,"")},TronWebProto.WitnessCreateContract.prototype.getOwnerAddress_asB64=function(){return jspb.Message.bytesAsB64(this.getOwnerAddress())},TronWebProto.WitnessCreateContract.prototype.getOwnerAddress_asU8=function(){return jspb.Message.bytesAsU8(this.getOwnerAddress())},TronWebProto.WitnessCreateContract.prototype.setOwnerAddress=function(e){return jspb.Message.setProto3BytesField(this,1,e)},TronWebProto.WitnessCreateContract.prototype.getUrl=function(){return jspb.Message.getFieldWithDefault(this,2,"")},TronWebProto.WitnessCreateContract.prototype.getUrl_asB64=function(){return jspb.Message.bytesAsB64(this.getUrl())},TronWebProto.WitnessCreateContract.prototype.getUrl_asU8=function(){return jspb.Message.bytesAsU8(this.getUrl())},TronWebProto.WitnessCreateContract.prototype.setUrl=function(e){return jspb.Message.setProto3BytesField(this,2,e)},jspb.Message.GENERATE_TO_OBJECT&&(TronWebProto.WitnessUpdateContract.prototype.toObject=function(e){return TronWebProto.WitnessUpdateContract.toObject(e,this)},TronWebProto.WitnessUpdateContract.toObject=function(e,t){var o={ownerAddress:t.getOwnerAddress_asB64(),updateUrl:t.getUpdateUrl_asB64()};return e&&(o.$jspbMessageInstance=t),o}),TronWebProto.WitnessUpdateContract.deserializeBinary=function(e){var t=new jspb.BinaryReader(e),o=new TronWebProto.WitnessUpdateContract;return TronWebProto.WitnessUpdateContract.deserializeBinaryFromReader(o,t)},TronWebProto.WitnessUpdateContract.deserializeBinaryFromReader=function(e,t){for(;t.nextField()&&!t.isEndGroup();){switch(t.getFieldNumber()){case 1:var o=t.readBytes();e.setOwnerAddress(o);break;case 12:o=t.readBytes();e.setUpdateUrl(o);break;default:t.skipField()}}return e},TronWebProto.WitnessUpdateContract.prototype.serializeBinary=function(){var e=new jspb.BinaryWriter;return TronWebProto.WitnessUpdateContract.serializeBinaryToWriter(this,e),e.getResultBuffer()},TronWebProto.WitnessUpdateContract.serializeBinaryToWriter=function(e,t){var o=void 0;(o=e.getOwnerAddress_asU8()).length>0&&t.writeBytes(1,o),(o=e.getUpdateUrl_asU8()).length>0&&t.writeBytes(12,o)},TronWebProto.WitnessUpdateContract.prototype.getOwnerAddress=function(){return jspb.Message.getFieldWithDefault(this,1,"")},TronWebProto.WitnessUpdateContract.prototype.getOwnerAddress_asB64=function(){return jspb.Message.bytesAsB64(this.getOwnerAddress())},TronWebProto.WitnessUpdateContract.prototype.getOwnerAddress_asU8=function(){return jspb.Message.bytesAsU8(this.getOwnerAddress())},TronWebProto.WitnessUpdateContract.prototype.setOwnerAddress=function(e){return jspb.Message.setProto3BytesField(this,1,e)},TronWebProto.WitnessUpdateContract.prototype.getUpdateUrl=function(){return jspb.Message.getFieldWithDefault(this,12,"")},TronWebProto.WitnessUpdateContract.prototype.getUpdateUrl_asB64=function(){return jspb.Message.bytesAsB64(this.getUpdateUrl())},TronWebProto.WitnessUpdateContract.prototype.getUpdateUrl_asU8=function(){return jspb.Message.bytesAsU8(this.getUpdateUrl())},TronWebProto.WitnessUpdateContract.prototype.setUpdateUrl=function(e){return jspb.Message.setProto3BytesField(this,12,e)},TronWebProto.VoteWitnessContract.repeatedFields_=[2],jspb.Message.GENERATE_TO_OBJECT&&(TronWebProto.VoteWitnessContract.prototype.toObject=function(e){return TronWebProto.VoteWitnessContract.toObject(e,this)},TronWebProto.VoteWitnessContract.toObject=function(e,t){var o={ownerAddress:t.getOwnerAddress_asB64(),votesList:jspb.Message.toObjectList(t.getVotesList(),TronWebProto.VoteWitnessContract.Vote.toObject,e),support:jspb.Message.getBooleanFieldWithDefault(t,3,!1)};return e&&(o.$jspbMessageInstance=t),o}),TronWebProto.VoteWitnessContract.deserializeBinary=function(e){var t=new jspb.BinaryReader(e),o=new TronWebProto.VoteWitnessContract;return TronWebProto.VoteWitnessContract.deserializeBinaryFromReader(o,t)},TronWebProto.VoteWitnessContract.deserializeBinaryFromReader=function(e,t){for(;t.nextField()&&!t.isEndGroup();){switch(t.getFieldNumber()){case 1:var o=t.readBytes();e.setOwnerAddress(o);break;case 2:o=new TronWebProto.VoteWitnessContract.Vote;t.readMessage(o,TronWebProto.VoteWitnessContract.Vote.deserializeBinaryFromReader),e.addVotes(o);break;case 3:o=t.readBool();e.setSupport(o);break;default:t.skipField()}}return e},TronWebProto.VoteWitnessContract.prototype.serializeBinary=function(){var e=new jspb.BinaryWriter;return TronWebProto.VoteWitnessContract.serializeBinaryToWriter(this,e),e.getResultBuffer()},TronWebProto.VoteWitnessContract.serializeBinaryToWriter=function(e,t){var o=void 0;(o=e.getOwnerAddress_asU8()).length>0&&t.writeBytes(1,o),(o=e.getVotesList()).length>0&&t.writeRepeatedMessage(2,o,TronWebProto.VoteWitnessContract.Vote.serializeBinaryToWriter),(o=e.getSupport())&&t.writeBool(3,o)},jspb.Message.GENERATE_TO_OBJECT&&(TronWebProto.VoteWitnessContract.Vote.prototype.toObject=function(e){return TronWebProto.VoteWitnessContract.Vote.toObject(e,this)},TronWebProto.VoteWitnessContract.Vote.toObject=function(e,t){var o={voteAddress:t.getVoteAddress_asB64(),voteCount:jspb.Message.getFieldWithDefault(t,2,0)};return e&&(o.$jspbMessageInstance=t),o}),TronWebProto.VoteWitnessContract.Vote.deserializeBinary=function(e){var t=new jspb.BinaryReader(e),o=new TronWebProto.VoteWitnessContract.Vote;return TronWebProto.VoteWitnessContract.Vote.deserializeBinaryFromReader(o,t)},TronWebProto.VoteWitnessContract.Vote.deserializeBinaryFromReader=function(e,t){for(;t.nextField()&&!t.isEndGroup();){switch(t.getFieldNumber()){case 1:var o=t.readBytes();e.setVoteAddress(o);break;case 2:o=t.readInt64();e.setVoteCount(o);break;default:t.skipField()}}return e},TronWebProto.VoteWitnessContract.Vote.prototype.serializeBinary=function(){var e=new jspb.BinaryWriter;return TronWebProto.VoteWitnessContract.Vote.serializeBinaryToWriter(this,e),e.getResultBuffer()},TronWebProto.VoteWitnessContract.Vote.serializeBinaryToWriter=function(e,t){var o=void 0;(o=e.getVoteAddress_asU8()).length>0&&t.writeBytes(1,o),0!==(o=e.getVoteCount())&&t.writeInt64(2,o)},TronWebProto.VoteWitnessContract.Vote.prototype.getVoteAddress=function(){return jspb.Message.getFieldWithDefault(this,1,"")},TronWebProto.VoteWitnessContract.Vote.prototype.getVoteAddress_asB64=function(){return jspb.Message.bytesAsB64(this.getVoteAddress())},TronWebProto.VoteWitnessContract.Vote.prototype.getVoteAddress_asU8=function(){return jspb.Message.bytesAsU8(this.getVoteAddress())},TronWebProto.VoteWitnessContract.Vote.prototype.setVoteAddress=function(e){return jspb.Message.setProto3BytesField(this,1,e)},TronWebProto.VoteWitnessContract.Vote.prototype.getVoteCount=function(){return jspb.Message.getFieldWithDefault(this,2,0)},TronWebProto.VoteWitnessContract.Vote.prototype.setVoteCount=function(e){return jspb.Message.setProto3IntField(this,2,e)},TronWebProto.VoteWitnessContract.prototype.getOwnerAddress=function(){return jspb.Message.getFieldWithDefault(this,1,"")},TronWebProto.VoteWitnessContract.prototype.getOwnerAddress_asB64=function(){return jspb.Message.bytesAsB64(this.getOwnerAddress())},TronWebProto.VoteWitnessContract.prototype.getOwnerAddress_asU8=function(){return jspb.Message.bytesAsU8(this.getOwnerAddress())},TronWebProto.VoteWitnessContract.prototype.setOwnerAddress=function(e){return jspb.Message.setProto3BytesField(this,1,e)},TronWebProto.VoteWitnessContract.prototype.getVotesList=function(){return jspb.Message.getRepeatedWrapperField(this,TronWebProto.VoteWitnessContract.Vote,2)},TronWebProto.VoteWitnessContract.prototype.setVotesList=function(e){return jspb.Message.setRepeatedWrapperField(this,2,e)},TronWebProto.VoteWitnessContract.prototype.addVotes=function(e,t){return jspb.Message.addToRepeatedWrapperField(this,2,e,TronWebProto.VoteWitnessContract.Vote,t)},TronWebProto.VoteWitnessContract.prototype.clearVotesList=function(){return this.setVotesList([])},TronWebProto.VoteWitnessContract.prototype.getSupport=function(){return jspb.Message.getBooleanFieldWithDefault(this,3,!1)},TronWebProto.VoteWitnessContract.prototype.setSupport=function(e){return jspb.Message.setProto3BooleanField(this,3,e)},goog.object.extend(exports,TronWebProto);