#include <iostream>
#include <algorithm>
#include <iomanip>
#include <sstream>

#include "../include/TransmitRequest.hpp"
#include "../include/Xbee.hpp"
#include "../include/Utility.hpp"
#include "Utility.cpp"

namespace XBEE {

  TransmitRequest::TransmitRequest() {
    frame_type = 0x10;
    target_mac_64 = static_cast<uint64_t> (BroadcastType_64::RESERVE_COORDINATOR);
    target_mac_16 = static_cast<uint16_t> (BroadcastType_16::DEFAULT);
    TransmitRequest::SetLength();
    TransmitRequest::SetChecksum();
  }

  TransmitRequest::TransmitRequest(uint64_t target_64) {
    frame_type = 0x10;
    target_mac_64 = target_64;
    target_mac_16 = static_cast<uint64_t> (BroadcastType_16::DEFAULT);
    TransmitRequest::SetLength();
    TransmitRequest::SetChecksum();
  }

  TransmitRequest::TransmitRequest(uint64_t target_64, uint16_t target_16) {
    frame_type = 0x10;
    target_mac_64 = target_64;
    target_mac_16 = target_16;
    TransmitRequest::SetLength();
    TransmitRequest::SetChecksum();
  }

  std::string TransmitRequest::ToHexString(HexFormat spacing) const {
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
          tmp << HexString(frame_id, even_space, data_space);
          tmp << HexString(target_mac_64, even_space, data_space);
          tmp << HexString(target_mac_16, even_space, data_space);
          tmp << HexString(broadcast_radius, even_space, data_space);
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

  std::vector<uint8_t> TransmitRequest::SerializeFrame() const {
    std::vector<uint8_t> temp;
    temp.push_back(start);
    std::vector<uint8_t> t1 = HexData(length);
    temp.insert(temp.end(), t1.begin(), t1.end());
    temp.push_back(frame_type);
    temp.push_back(frame_id);
    t1 = HexData(target_mac_64);
    temp.insert(temp.end(), t1.begin(), t1.end());
    t1 = HexData(target_mac_16);
    temp.insert(temp.end(), t1.begin(), t1.end());
    temp.push_back(broadcast_radius);
    temp.push_back(options);
    auto itr = data.begin();
    while(*itr != 0x00)
      temp.push_back(*itr++);
    temp.push_back(checksum);
    return temp;
  }

  void TransmitRequest::SetData(const std::string &message) {
    auto data_itr = data.begin();
    for (auto letter = message.begin(); letter != message.end(); ++data_itr, ++letter) {
      *data_itr = *letter;
    }
    TransmitRequest::SetLength();
    TransmitRequest::SetChecksum();
  }

  void TransmitRequest::SetLength() {
    length = sizeof (frame_type)
            + sizeof (frame_id)
            + sizeof (target_mac_64)
            + sizeof (target_mac_16)
            + sizeof (broadcast_radius)
            + sizeof (options);
    for (auto it = data.begin(); it != data.end(); ++it) {
      length += (*it != 0x00) ? sizeof (*it) : 0x00;
    }
  }

  void TransmitRequest::SetChecksum() {

    uint8_t byte_sum = ByteSum(frame_type);
    byte_sum += ByteSum(frame_id);
    byte_sum += ByteSum(target_mac_64);
    byte_sum += ByteSum(target_mac_16);
    byte_sum += broadcast_radius;
    byte_sum += options;

    for (auto itr = data.begin(); itr != data.end(); ++itr) {
      byte_sum += *itr;
    }

    checksum = kMaxChecksum - byte_sum;
  }

  // Add delimiter support
  std::istream& operator>>(std::istream &strm, TransmitRequest &tr) {
    std::string temp;
    std::getline(strm, temp);
    tr.SetData(temp);
    return strm;
  }
}