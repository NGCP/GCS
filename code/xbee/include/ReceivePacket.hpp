#ifndef RECIEVE_PACKET_HPP
#define RECIEVE_PACKET_HPP

#include "Xbee.hpp"
#include "Frame.hpp"
#include "SerialXbee.hpp"

namespace XBEE {
  // Allow API mode 2 with escape characters
  class ReceivePacket : public Frame {
  friend class SerialXbee;
  public:
    ReceivePacket();
    ReceivePacket(uint64_t source_64);
    ReceivePacket(uint64_t source_64, uint16_t source_16);
    // TODO Eventually use enums for options

    std::string GetData();
    std::string ToHexString(HexFormat spacing = HexFormat::NO_SPACING) const;
    std::vector<uint8_t>SerializeFrame() const;

  protected:
    uint64_t source_mac_64;
    uint16_t source_mac_16;
    // Used to set packet options (not yet implemented)
    uint8_t options = 0x00;
    // Possible bug: Cannot receive the null character
    // In XCTU, data field theoretically holds 65521 bytes
    std::array<uint8_t, 256> data{};

  private:
    void SetLength();
    void SetChecksum();
    void SetChecksum_old();
    void SetData();
    
// TODO: Finish implementation, currently mimics behavior of TransmitRequest << operator
//    friend std::ostream& operator<<(std::ostream &strm, const ReceivePacket &rp) {
//      return strm << rp.ToHexString();
//    }
  };
}
#endif