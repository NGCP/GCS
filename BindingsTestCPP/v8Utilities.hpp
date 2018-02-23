#ifndef V8_UTILITIES
#define V8_UTILITIES

#include <string>
#include <iostream>
#include <node.h>


/*
   V8 utilities provides access to frequently done tasks.
*/



/*
   Convert a v8 style string to a std::string
*/
inline std::string toStr(v8::Local<v8::Value> v8_str) {
   v8::String::Utf8Value v8_str_utf8(v8_str);
   std::string str_from_utf8(*v8_str_utf8);
   return str_from_utf8;
}

/*
   Convert a std::string to a v8 style string.
   The v8 string gets allocated, and thus is wrapped in v8::Local, and requires
   an instance of isolate in order to allocate
*/
inline v8::Local<v8::String> toV8Str(v8::Isolate *isolate, std::string& str) {
   return v8::String::NewFromUtf8(isolate, str.c_str());
}


#endif
