#include <iostream>
#include <algorithm>
#include <iomanip>
#include <sstream>

//#include "../include/TransmitRequest.hpp"
#include "../include/ReceivePacket.hpp"
#include "../include/Xbee.hpp"
#include "../include/Utility.hpp"
#include "Utility.cpp"

namespace XBEE {

  ReceivePacket::ReceivePacket() {
    frame_type = 0x90;
    source_mac_64 = static_cast<uint64_t> (BroadcastType_64::UNKNOWN);
    source_mac_16 = static_cast<uint16_t> (BroadcastType_16::DEFAULT);
    ReceivePacket::SetLength();
    ReceivePacket::SetChecksum();
  }

  ReceivePacket::ReceivePacket(uint64_t source_64) {
    frame_type = 0x90;
    source_mac_64 = source_64;
    source_mac_16 = static_cast<uint64_t> (BroadcastType_16::DEFAULT);
    ReceivePacket::SetLength();
    ReceivePacket::SetChecksum();
  }

  ReceivePacket::ReceivePacket(uint64_t source_64, uint16_t source_16) {
    frame_type = 0x90;
    source_mac_64 = source_64;
    source_mac_16 = source_16;
    ReceivePacket::SetLength();
    ReceivePacket::SetChecksum();
  }

  void ReceivePacket::SetLength() {
    length = sizeof (frame_type)
            + sizeof (source_mac_64)
            + sizeof (source_mac_16)
            + sizeof (options);
    for (auto it = data.begin(); it != data.end(); ++it) {
      length += (*it != 0x00) ? sizeof (*it) : 0x00;
    }
  }

  // TODO: Possible bug that actual 0x00 character will not be successfully returned
  std::string ReceivePacket::GetData() {
    auto itr = data.begin();
    std::string temp = "";
    while(*itr != 0x00) {
      temp += static_cast<char>(*itr++);
    }
    return temp;
  }

  // TODO: Make a generic function that returns a vector of uint8_t
  std::vector<uint8_t> ReceivePacket::SerializeFrame() const {
    std::vector<uint8_t> temp;
    temp.push_back(start);
    temp.insert(temp.end(), HexData(length).begin(), HexData(length).end());
    temp.push_back(frame_type);
    temp.insert(temp.end(), HexData(source_mac_64).begin(), HexData(source_mac_64).end());
    temp.insert(temp.end(), HexData(source_mac_16).begin(), HexData(source_mac_16).end());
    temp.push_back(options);
    auto itr = data.begin();
    while(*itr != 0x00)
      temp.push_back(*itr++);
    temp.push_back(checksum);
    return temp;
  }

  std::string ReceivePacket::ToHexString(HexFormat spacing) const {
        std::stringstream tmp;
    // TODO: Implement HexString function without third argument
      bool even_space = false;
      bool data_space = false;
      switch (spacing) {
        case HexFormat::BYTE_SPACING:
          even_space = true;
        case HexFormat::DATA_SPACING:
          data_space = true;
        case HexFormat::NO_SPACING:
          tmp << HexString(start, even_space, data_space);
          tmp << HexString(length, even_space, data_space);
          tmp << HexString(frame_type, even_space, data_space);
          tmp << HexString(source_mac_64, even_space, data_space);
          tmp << HexString(source_mac_16, even_space, data_space);
          tmp << HexString(options, even_space, data_space);
          for (auto itr = data.begin(); itr != data.end(); ++itr)
            if (*itr != 0x00)
              tmp << HexString(*itr, even_space, even_space);
              
          // TODO: Figure out how to avoid if statement
          // checksum wont be spaced for DATA_SPACING case
          // if a ' ' is thrown in, checksum wont be not spaced for NO_SPACING case
          if (spacing == HexFormat::DATA_SPACING) tmp << ' ';
          tmp << HexString(checksum, even_space, false);
      }
      return tmp.str();
  }

  void ReceivePacket::SetChecksum() {

    uint8_t byte_sum = ByteSum(frame_type);
    byte_sum += ByteSum(source_mac_64);
    byte_sum += ByteSum(source_mac_16);
    byte_sum += options;

    for (auto itr = data.begin(); itr != data.end(); ++itr) {
      byte_sum += *itr;
    }
    checksum = kMaxChecksum - byte_sum;
  }

}