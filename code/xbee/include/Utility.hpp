/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* 
 * File:   Utility.hpp
 * Author: zhangh94
 *
 * Created on November 9, 2016, 4:54 PM
 */

#ifndef UTILITY_HPP
#define UTILITY_HPP

#include <vector>

namespace XBEE {
  // HexString functions and overloads
  template <typename T> std::string HexString(const T &value,bool is_spaced = true, bool end_space = false, 
                                              bool little_endian = true);
  inline std::string HexString(char value[], bool is_spaced = true,  bool end_space = false);
  inline std::string HexString(const char value[], bool is_spaced = true,  bool end_space = false);
  inline std::string HexString(const std::string &value, bool is_spaced = true,  bool end_space = false);
    
  // ByteSum functions and overloads
  inline uint8_t ByteSum(char *item);
  inline uint8_t ByteSum(const char *item);
  inline uint8_t ByteSum(const std::string& item);
  template<typename T> uint8_t ByteSum(T &item);  
  
  // HexData functions and overloads
  template <typename T> std::vector<uint8_t> HexData(T &item);
}
#endif /* UTILITY_HPP */