#ifndef FRAME_HPP
#define FRAME_HPP

#include "Xbee.hpp"
#include <vector>

namespace XBEE {
	class Frame {
	public:
		virtual std::string ToHexString(HexFormat spacing) const = 0;
		virtual std::vector<uint8_t> SerializeFrame() const = 0;

	protected:
		uint8_t start	= 0x7E;
		uint16_t length;
		uint8_t frame_type;
		uint8_t checksum;

		virtual void SetLength() = 0;
		virtual void SetChecksum() = 0;
	};
}
#endif
