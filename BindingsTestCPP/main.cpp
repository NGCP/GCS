#include <node.h>
#include <string>
#include <queue>
#include <mutex>

#include "include/Frame.hpp"
#include "include/ReceivePacket.hpp"
#include "include/SerialXbee.hpp"
#include "include/TransmitRequest.hpp"
#include "include/Utility.hpp"
#include "src/Utility.cpp" //Inlined functions in utility.cpp should be defined in the hpp file?
#include "include/Xbee.hpp"

#include "v8Utilities.hpp"


using v8::Exception;
using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Persistent;
using v8::Function;
using v8::Number;
using v8::Array;
using v8::Integer;
using v8::Object;
using v8::String;
using v8::Value;
using v8::V8;

/*
   Class to manage the storing of messages.
 */
class DataStore {
   public:
      void push(std::string value) {
         lock.lock();
         dataStore.push(value);
         lock.unlock();
      }
      std::vector<std::string> popAll() {

         lock.lock();
         std::vector<std::string> returnArray;
         while(!dataStore.empty()) {
            returnArray.push_back(dataStore.front());
            dataStore.pop();
         }
         lock.unlock();

         return returnArray;
      }
   private:
      std::mutex lock;
      std::queue<std::string> dataStore;
};


DataStore store;
XBEE::SerialXbee connection;
XBEE::TransmitRequest sendFrame;
Persistent<Function> readCallbackFunc;


/*
   Overwrite the default read handler in serialXbee
   sends the string to the registered callback function (if set)
*/
void frameReadHandler(XBEE::Frame *a_frame) {

   XBEE::ReceivePacket *r_frame = (XBEE::ReceivePacket*)a_frame;
   std::string output = r_frame->GetData();

   store.push(output);
}


/**
 * Function to create a xbee connection object, and attempt to connect.
 * Returns integer. 0 on success, non-zero on connection failure
 * Overwrites any prexisting connection!
 * Links up the connection with the frameReadHandler
 */
void connect(const FunctionCallbackInfo<Value>& args) {
   Isolate* isolate = args.GetIsolate();
   Local<Integer> successStatus;

   std::string device_path;
   uint32_t baud_rate;

   switch (args.Length()) {
      case 2:
         // device_path (String) and Baud rate (uint32)
         if(!args[0]->IsString() || !args[1]->IsUint32()) {
            isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "Invalid arguments")));
            return;
         }
         //convert v8 String to std::string
         device_path = toStr(args[0]);
         //convert v8 uint32 to std::string
         baud_rate = args[1]->Uint32Value();

         //attempt connection: store result
         successStatus = Integer::New(isolate, connection.Connect(device_path, baud_rate));
         break;
      case 1:
         // device_path (String)
         if(!args[0]->IsString()) {
            isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "Invalid arguments")));
            return;
         }
         device_path = toStr(args[0]);

         //attempt connection: store result
         successStatus = Integer::New(isolate, connection.Connect(device_path));
         break;
      default:
         //attempt connection: store result
         successStatus = Integer::New(isolate, connection.Connect());
         break;
   }
   //set the read handler to custom handler (the init callback must be called to finish setting up)
   connection.ReadHandler = std::bind(frameReadHandler, std::placeholders::_1);
   //return the success status of the connection
   args.GetReturnValue().Set(successStatus);
}


/**
 * Send the data to the Mac address given by the arguments.
 * Expects 1, 2 or 3 arguments in the following order:
 *    String data, String target_address_64, uint16_t target_16
 * Return value of 0 indicates success, otherwise error
 */
void sendData(const FunctionCallbackInfo<Value>& args) {
   Isolate* isolate = args.GetIsolate();
   Local<Integer> successStatus;
   std::string dataString;
   uint64_t target_64;
   uint16_t target_16;

   //first argument must be the string of the data to send
   if(!args[0]->IsString()) {
      isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "Invalid arguments")));
      return;
   } else {
      dataString = toStr(args[0]);
   }

   switch (args.Length()) {
      case 3:
         if(!args[1]->IsString() || !args[2]->IsNumber()) {
            isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "Invalid arguments")));
            return;
         }
         //get Integer target addresses
         target_64 = std::stoull(toStr(args[1]), nullptr, 0);
         target_16 = (uint16_t)(args[2]->IntegerValue());
         sendFrame = XBEE::TransmitRequest(target_64, target_16);

         successStatus = Integer::New(isolate, 0);
         break;
      case 2:
         if(!args[1]->IsString()) {
            isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "Invalid arguments")));
            return;
         }
         //get Integer target addresses
         target_64 = std::stoull(toStr(args[1]), nullptr, 0);
         sendFrame = XBEE::TransmitRequest(target_64);

         successStatus = Integer::New(isolate, 0);
         break;
      case 1:
         sendFrame = XBEE::TransmitRequest();

         successStatus = Integer::New(isolate, 0);
         break;
      default:
         isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "Invalid arguments")));
         return;
   }

   //send data to frame created
   sendFrame.SetData(dataString);
   connection.AsyncWriteFrame(&sendFrame);
   //return the success status of the connection
   args.GetReturnValue().Set(successStatus);
}



void getData(const FunctionCallbackInfo<Value>& args) {
   Isolate* isolate = args.GetIsolate();

   std::vector<std::string> values = store.popAll();
   Local<Array> returnData = Array::New(isolate, values.size());
   for(int i = 0; i < values.size(); i++) {
      returnData->Set(i, toV8Str(isolate, values[i]));
   }
   args.GetReturnValue().Set(returnData);
}



/**
 * Create the module by exporting the available functions that can
 * be called from the NodeJS side
 */
void Initialize(Local<Object> exports) {
   NODE_SET_METHOD(exports, "connect", connect);
   NODE_SET_METHOD(exports, "sendData", sendData);
   NODE_SET_METHOD(exports, "getData", getData);
}

//Required funcall to set up module
NODE_MODULE(module_name, Initialize)
