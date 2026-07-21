import assert from "node:assert/strict";import test from "node:test";
import {cleanResponseDraft,validateStageMove} from "../../lib/workflow-portal.ts";
test("workflow advances only one governed stage",()=>{assert.equal(validateStageMove("intake","qualification",true),true);assert.throws(()=>validateStageMove("intake","response",true),/one governed stage/);assert.throws(()=>validateStageMove("intake","qualification",false),/gate/)});
test("response exports require identifying fields",()=>assert.throws(()=>cleanResponseDraft({responseType:"RFP"}),/Client/));
test("response draft is normalized and bounded",()=>{const value=cleanResponseDraft({responseType:"RFQ",client:" Agency ",title:" Work ",solicitation:" RFQ-1 ",approach:"x".repeat(13000)});assert.equal(value.responseType,"RFQ");assert.equal(value.client,"Agency");assert.equal(value.approach.length,12000)});
