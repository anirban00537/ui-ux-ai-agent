"use client";

import { useAppDispatch } from "@/store/hooks";
import {
  addCard as addCardAction,
  deleteCard as deleteCardAction,
  replaceCardWithServerData,
  Card,
} from "@/store/slices/cardsSlice";
import { useAddCard, useDeleteCard } from "@/hooks/use-docs";
import { toast } from "sonner";
import { nanoid } from "nanoid";

/**
 * Hook for explicit card structural actions (add, delete).
 * Handles both Redux state and immediate API calls.
 */
export function useCardActions(docId: string | null) {
  const dispatch = useAppDispatch();
  const addCardMutation = useAddCard();
  const deleteCardMutation = useDeleteCard();

  const handleAddCard = async (
    afterCardId?: string,
    initialData?: { rows: any[]; accent?: any }
  ) => {
    if (!docId) return;

    const tempId = `temp-${nanoid()}`;

    // 1. Dispatch Redux action (optimistic UI)
    dispatch(
      addCardAction({
        afterCardId,
        id: tempId,
        card: initialData
          ? {
              rows: initialData.rows,
              accent: initialData.accent,
            }
          : undefined,
      })
    );

    try {
      const defaultData = {
        rows: [
          {
            id: nanoid(),
            blocks: [{ id: nanoid(), type: "prosemirror", content: {} }],
          },
        ],
      };

      const payloadData = initialData
        ? {
            rows: initialData.rows,
            accent: initialData.accent,
          }
        : defaultData;

      const response = await addCardMutation.mutateAsync({
        docId,
        payload: {
          data: payloadData,
        },
      });

      if (response.success && response.data) {
        const serverCard: Card = {
          id: response.data.id,
          rows: response.data.data?.rows || [],
          accent: response.data.data?.accent,
        };

        dispatch(
          replaceCardWithServerData({
            clientId: tempId,
            serverCard,
          })
        );
      }
    } catch (error) {
      console.error("Failed to add card:", error);
      toast.error("Failed to save new card");
      // Revert optimistic update
      dispatch(deleteCardAction(tempId));
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!docId) return;

    try {
      // 1. Dispatch Redux action
      dispatch(deleteCardAction(cardId));

      // 2. Call API
      await deleteCardMutation.mutateAsync({
        docId,
        cardId,
      });
    } catch (error) {
      console.error("Failed to delete card:", error);
      toast.error("Failed to delete card from server");
      // Ideally we should revert the Redux state here,
      // but redo/undo handles some of this.
    }
  };

  return {
    handleAddCard,
    handleDeleteCard,

    isDeleting: deleteCardMutation.isPending,
    isAdding: addCardMutation.isPending,
  };
}
