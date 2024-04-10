import React from "react";
import { useRegions } from "../RegionsProvider";
import { BaseRegionsDropdown, HorizontalAlignment } from "./BaseRegionsDropdown";
import { BaseRegionsDropdownItem } from "./BaseRegionsDropdownItem";

interface DropdownOption {
  label: string;
  chosen: boolean;
  channelSlug: string;
}

export interface ChannelDropdownProps {
  horizontalAlignment?: HorizontalAlignment;
}

export function ChannelDropdown({ horizontalAlignment }: ChannelDropdownProps) {
  const { channels, currentChannel, setCurrentChannel } = useRegions();

  const channelOptions: DropdownOption[] = channels.map((ch) => ({
    label: ch.name,
    chosen: ch.slug === currentChannel.slug,
    channelSlug: ch.slug,
  }));

  const onChannelChange = (channelSlug: string) => {
    if (channelSlug === currentChannel.slug) {
      return;
    }
    setCurrentChannel(channelSlug).catch(console.error);
  };

  return (
    <BaseRegionsDropdown
      label={currentChannel.currencyCode}
      horizontalAlignment={horizontalAlignment}
    >
      {channelOptions.map((option) => (
        <BaseRegionsDropdownItem
          key={option.label}
          chosen={option.chosen}
          label={option.label}
          onClick={() => onChannelChange(option.channelSlug)}
        />
      ))}
    </BaseRegionsDropdown>
  );
}

export default ChannelDropdown;
