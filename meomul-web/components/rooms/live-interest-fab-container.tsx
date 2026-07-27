import { memo, useEffect, useRef } from "react";
import { LiveInterestFab } from "@/components/rooms/live-interest-fab";
import { useRoomLiveViewers } from "@/lib/hooks/use-room-live-viewers";
import { useToast } from "@/components/ui/toast-provider";

interface LiveInterestFabContainerProps {
  roomId: string;
  availableRooms: number;
  containerClassName?: string;
}

export const LiveInterestFabContainer = memo(function LiveInterestFabContainer({
  roomId,
  availableRooms,
  containerClassName,
}: LiveInterestFabContainerProps) {
  const { viewerCount, connected } = useRoomLiveViewers({ roomId });
  const toast = useToast();
  const previousCountRef = useRef<number | null>(null);

  useEffect(() => {
    if (!connected) {
      previousCountRef.current = viewerCount;
      return;
    }

    const previous = previousCountRef.current;
    if (previous === null) {
      previousCountRef.current = viewerCount;
      return;
    }

    if (viewerCount > previous && previous >= 1) {
      const added = viewerCount - previous;
      toast.info(
        `${added === 1 ? "1 new guest just started viewing this room." : `${added} guests just joined this room page.`}`,
      );
    }

    previousCountRef.current = viewerCount;
  }, [viewerCount, connected, toast]);

  return (
    <LiveInterestFab
      viewerCount={viewerCount}
      connected={connected}
      availableRooms={availableRooms}
      containerClassName={containerClassName}
    />
  );
});
