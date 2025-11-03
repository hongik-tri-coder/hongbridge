"use client";
import { useEffect, useMemo, useState, Fragment } from "react";
import { Box, Heading, Button, HStack, VStack, Text, Input, Textarea, Portal } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import RequireAuth from "@/components/RequireAuth";
import { getSchedules, createSchedule, ScheduleDto, updateSchedule, deleteSchedule } from "@/lib/api";

function useMonth(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) grid.push(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(new Date(year, month, d));
  // fill to complete rows of 7
  while (grid.length % 7 !== 0) grid.push(null);
  return { year, month, grid };
}

export default function CalendarPage() {
  const [cursor, setCursor] = useState(() => new Date());
  const [schedules, setSchedules] = useState<ScheduleDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create modal state
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");

  // Detail modal state for view/edit/delete
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<ScheduleDto | null>(null);
  const [edit, setEdit] = useState(false);
  const [etitle, setETitle] = useState("");
  const [edescription, setEDescription] = useState("");
  const [estart, setEStart] = useState<string>("");
  const [eend, setEEnd] = useState<string>("");

  const { grid, year, month } = useMonth(cursor);
  const monthLabel = useMemo(() => `${year}년 ${month + 1}월`, [year, month]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const list = await getSchedules();
        setSchedules(list);
        setError(null);
      } catch (e: any) {
        const msg = e?.message ? String(e.message) : "일정 목록을 불러오지 못했어요.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  const onPrev = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const onNext = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  const onToday = () => setCursor(new Date());

  const eventsByDay = useMemo(() => {
    const map = new Map<string, ScheduleDto[]>();
    for (const s of schedules) {
      const startDate = new Date(s.start);
      const endDate = new Date(s.end);

      // 잘못된 범위 보호: 종료가 시작보다 이전이면 단일일 이벤트로 처리
      const effectiveEnd = endDate.getTime() >= startDate.getTime() ? endDate : startDate;

      // 날짜만 비교/증가하기 위해 각 날짜의 00:00 기준으로 설정
      let cur = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const endDay = new Date(effectiveEnd.getFullYear(), effectiveEnd.getMonth(), effectiveEnd.getDate());

      while (cur.getTime() <= endDay.getTime()) {
        const key = `${cur.getFullYear()}-${cur.getMonth()}-${cur.getDate()}`;
        const arr = map.get(key) ?? [];
        arr.push(s);
        map.set(key, arr);
        // 다음 날로 이동 (고정 24h 증가)
        cur = new Date(cur.getTime() + 24 * 60 * 60 * 1000);
      }
    }
    return map;
  }, [schedules]);

  // 주(7일) 단위로 그리드를 분할
  const weeks = useMemo(() => {
    const arr: (Date | null)[][] = [];
    for (let i = 0; i < grid.length; i += 7) {
      arr.push(grid.slice(i, i + 7));
    }
    return arr;
  }, [grid]);

  const isMultiDay = (s: ScheduleDto) => {
    const sd = new Date(s.start);
    const ed = new Date(s.end);
    const sdn = new Date(sd.getFullYear(), sd.getMonth(), sd.getDate());
    const edn = new Date(ed.getFullYear(), ed.getMonth(), ed.getDate());
    return edn.getTime() !== sdn.getTime();
  };

  // 한 주에 표시할 막대 정보 계산
  type WeekBar = {
    schedule: ScheduleDto;
    startCol: number; // 1..7
    endCol: number;   // 1..7
    isStart: boolean; // 해당 주에서 시작
    isEnd: boolean;   // 해당 주에서 종료
    lane: number;     // 0..N
  };

  const computeWeekBars = (week: (Date | null)[]): WeekBar[] => {
    const dates = week;
    const validDates = dates.filter(Boolean) as Date[];
    if (validDates.length === 0) return [];

    const weekStart = new Date(
      validDates[0].getFullYear(),
      validDates[0].getMonth(),
      validDates[0].getDate()
    );
    const weekEnd = new Date(
      validDates[validDates.length - 1].getFullYear(),
      validDates[validDates.length - 1].getMonth(),
      validDates[validDates.length - 1].getDate()
    );

    const bars: Omit<WeekBar, "lane">[] = [];

    for (const s of schedules) {
      const sStartDate = new Date(s.start);
      const sEndDate = new Date(s.end);
      const effectiveEnd = sEndDate.getTime() >= sStartDate.getTime() ? sEndDate : sStartDate;
      const sStart = new Date(sStartDate.getFullYear(), sStartDate.getMonth(), sStartDate.getDate());
      const sEnd = new Date(effectiveEnd.getFullYear(), effectiveEnd.getMonth(), effectiveEnd.getDate());

      // 단일일 이벤트는 막대 처리에서 제외
      if (sEnd.getTime() === sStart.getTime()) continue;

      // 주 범위와 겹치지 않으면 건너뜀
      if (sEnd < weekStart || sStart > weekEnd) continue;

      // 해당 주에서의 시작/끝 컬럼 계산
      let startCol = -1;
      let endCol = -1;
      for (let i = 0; i < dates.length; i++) {
        const d = dates[i];
        if (!d) continue;
        const dn = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        if (startCol === -1 && dn >= sStart) startCol = i + 1;
        if (dn <= sEnd) endCol = i + 1;
      }
      if (startCol === -1) {
        // 이벤트 시작이 주보다 이전이면 첫 실날짜 칸으로 고정
        for (let i = 0; i < dates.length; i++) if (dates[i]) { startCol = i + 1; break; }
      }
      if (endCol === -1) {
        // 이벤트 종료가 첫 실날짜 이전이면 건너뛰지만, 위에서 겹침 검사로 걸러짐
        for (let i = dates.length - 1; i >= 0; i--) if (dates[i]) { endCol = i + 1; break; }
      }
      if (startCol === -1 || endCol === -1) continue;

      const isStart = sStart >= weekStart;
      const isEnd = sEnd <= weekEnd;

      bars.push({ schedule: s, startCol, endCol, isStart, isEnd });
    }

    // 시작 위치 기준 정렬, 같은 시작이면 길이 긴 것을 먼저 배치
    bars.sort((a, b) => a.startCol - b.startCol || (b.endCol - b.startCol) - (a.endCol - a.startCol));

    // 레인 배치 (겹치지 않도록 위에서부터 채움)
    const laneEnds: number[] = [];
    const result: WeekBar[] = [];
    for (const b of bars) {
      let lane = 0;
      while (lane < laneEnds.length && b.startCol <= laneEnds[lane]) lane++;
      if (lane === laneEnds.length) laneEnds.push(b.endCol);
      else laneEnds[lane] = b.endCol;
      result.push({ ...b, lane });
    }
    return result;
  };

  const openCreateDefault = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const base = `${yyyy}-${mm}-${dd}`;
    setTitle("");
    setDescription("");
    setStart(`${base}T09:00`);
    setEnd(`${base}T10:00`);
    setOpen(true);
  };

  const onCreate = async () => {
    if (!title.trim() || !start || !end) return;
    const body: ScheduleDto = {
      title: title.trim(),
      description: description.trim() || undefined,
      start,
      end,
    };
    try {
      const created = await createSchedule(body);
      setSchedules((prev) => [created, ...prev]);
      setOpen(false);
      setError(null);
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : "일정 추가에 실패했어요.";
      setError(msg);
    }
  };

  const openDetail = (s: ScheduleDto) => {
    setSelected(s);
    setETitle(s.title ?? "");
    setEDescription(s.description ?? "");
    setEStart(s.start);
    setEEnd(s.end);
    setEdit(false);
    setDetailOpen(true);
  };

  const onUpdate = async () => {
    if (!selected?.id) return;
    if (!etitle.trim() || !estart || !eend) return;
    try {
      const updated = await updateSchedule(selected.id, {
        title: etitle.trim(),
        description: edescription.trim() || undefined,
        start: estart,
        end: eend,
      });
      setSchedules((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setSelected(updated);
      setEdit(false);
      setError(null);
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : "일정 수정에 실패했어요.";
      setError(msg);
    }
  };

  const onDelete = async () => {
    if (!selected?.id) return;
    try {
      await deleteSchedule(selected.id);
      setSchedules((prev) => prev.filter((p) => p.id !== selected.id));
      setDetailOpen(false);
      setSelected(null);
      setError(null);
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : "일정 삭제에 실패했어요.";
      setError(msg);
    }
  };

  return (
    <RequireAuth>
      <Box>
        <HStack justify="space-between" mb={4}>
          <Heading size="lg">캘린더</Heading>
          <HStack gap={2}>
            <Button variant="outline" onClick={onPrev} aria-label="이전">
              <ChevronLeftIcon />
            </Button>
            <Button variant="outline" onClick={onToday}>오늘</Button>
            <Button variant="outline" onClick={onNext} aria-label="다음">
              <ChevronRightIcon />
            </Button>
            <Button bg="black" color="white" _hover={{ bg: "gray.800" }} onClick={openCreateDefault} aria-label="추가">+</Button>
          </HStack>
        </HStack>
        <Text color="gray.600" mb={3}>{monthLabel}</Text>

        {error && (
          <Box mb={3} p={3} rounded="md" border="1px solid" borderColor="red.200" bg="red.50">
            <Text fontSize="sm" color="red.700">{error}</Text>
          </Box>
        )}

        <Box border="1px solid" borderColor="gray.200" rounded="xl" overflow="hidden">
          {/* Weekday header */}
          <HStack bg="gray.50" borderBottom="1px solid" borderColor="gray.200" px={3} py={2}>
            {['일','월','화','수','목','금','토'].map((w) => (
              <Box key={w} flex="1" textAlign="center" fontWeight="medium">{w}</Box>
            ))}
          </HStack>

          {/* Calendar grid with in-cell thin lines for multi-day events */}
          {weeks.map((week, wi) => {
            const bars = computeWeekBars(week);
            const laneCount = bars.reduce((max, b) => Math.max(max, b.lane + 1), 0);
            const overlayHeight = laneCount * 18; // 선+제목 공간
            return (
              <Box key={wi} position="relative">
                {/* Day cells for this week */}
                <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap={0}>
                  {week.map((day, i) => {
                    const colKey = `${wi}-${i}`;
                    if (!day) {
                      return <Box key={colKey} minH="120px" borderRight="1px solid" borderColor="gray.100" bg="gray.50" />;
                    }
                    const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
                    const items = (eventsByDay.get(key) ?? []).filter((s) => !isMultiDay(s));
                    return (
                      <Box key={colKey} minH="120px" p={2} borderRight="1px solid" borderColor="gray.100" borderBottom="1px solid" _hover={{ bg: "gray.50" }}>
                        <Text fontSize="sm" color="gray.700" mb={2}>{day.getDate()}</Text>
                        <VStack align="stretch" gap={1} mt={overlayHeight ? `${overlayHeight + 6}px` : 0}>
                          {items.slice(0,3).map((s) => (
                            <Box key={s.id ?? `${s.title}-${s.start}`} bg="gray.900" color="white" rounded="md" px={2} py={1} cursor="pointer" onClick={() => openDetail(s)}>
                              <Text fontSize="xs" fontWeight="medium" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{s.title}</Text>
                            </Box>
                          ))}
                          {items.length > 3 && (
                            <Text fontSize="xs" color="gray.600">+{items.length - 3} more</Text>
                          )}
                        </VStack>
                      </Box>
                    );
                  })}
                </Box>

                {/* Overlay: thin lines + titles for multi-day events (no extra row above dates) */}
                {laneCount > 0 && (
                  <Box
                    position="absolute"
                    insetX={0}
                    top="28px"
                    display="grid"
                    gridTemplateColumns="repeat(7, 1fr)"
                    gridAutoRows="18px"
                    gap={0}
                    zIndex={1}
                  >
                    {bars.map((b, bi) => (
                      <Fragment key={`bar-${wi}-${bi}-${b.schedule.id ?? `${b.schedule.title}-${b.schedule.start}`}` }>
                        {/* spanning thin line across start→end */}
                        <Box
                          gridColumn={`${b.startCol} / ${b.endCol + 1}`}
                          gridRow={`${b.lane + 1}`}
                          position="relative"
                          cursor="pointer"
                          onClick={() => openDetail(b.schedule)}
                          zIndex={0}
                        >
                          <Box
                            position="absolute"
                            top={0}
                            left={b.isStart ? "8px" : 0}
                            right={b.isEnd ? "8px" : 0}
                            height="2px"
                            bg="black"
                            borderRadius="md"
                          />
                        </Box>
                        {/* title only in the start cell */}
                        <Box
                          gridColumn={`${b.startCol} / ${b.startCol + 1}`}
                          gridRow={`${b.lane + 1}`}
                          position="relative"
                          cursor="pointer"
                          onClick={() => openDetail(b.schedule)}
                          zIndex={1}
                        >
                          <Box position="absolute" top="6px" left="8px" right="8px">
                            <Text fontSize="xs" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{b.schedule.title}</Text>
                          </Box>
                        </Box>
                      </Fragment>
                    ))}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>

        {open && (
          <Portal>
            <Box position="fixed" inset={0} bg="blackAlpha.600" display="flex" alignItems="center" justifyContent="center" zIndex={1000}>
              <Box w="100%" maxW="lg" bg="white" rounded="lg" shadow="lg" p={4}>
                <Heading size="sm" mb={3}>일정 추가</Heading>
                <VStack align="stretch" gap={3}>
                  <Input placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} />
                  <Textarea placeholder="설명(선택)" value={description} onChange={(e) => setDescription(e.target.value)} />
                  <HStack>
                    <Box flex="1">
                      <Text fontSize="sm" mb={1}>시작</Text>
                      <Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
                    </Box>
                    <Box flex="1">
                      <Text fontSize="sm" mb={1}>종료</Text>
                      <Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
                    </Box>
                  </HStack>
                  <HStack justify="end">
                    <Button variant="ghost" onClick={() => setOpen(false)}>취소</Button>
                    <Button bg="black" color="white" _hover={{ bg: "gray.800" }} onClick={onCreate}>추가</Button>
                  </HStack>
                </VStack>
              </Box>
            </Box>
          </Portal>
        )}

        {detailOpen && selected && (
          <Portal>
            <Box position="fixed" inset={0} bg="blackAlpha.600" display="flex" alignItems="center" justifyContent="center" zIndex={1000}>
              <Box w="100%" maxW="lg" bg="white" rounded="lg" shadow="lg" p={4}>
                <Heading size="sm" mb={3}>일정 상세</Heading>
                <VStack align="stretch" gap={3}>
                  <Input placeholder="제목" value={etitle} onChange={(e) => setETitle(e.target.value)} readOnly={!edit} />
                  <Textarea placeholder="설명(선택)" value={edescription} onChange={(e) => setEDescription(e.target.value)} readOnly={!edit} />
                  <HStack>
                    <Box flex="1">
                      <Text fontSize="sm" mb={1}>시작</Text>
                      <Input type="datetime-local" value={estart} onChange={(e) => setEStart(e.target.value)} readOnly={!edit} />
                    </Box>
                    <Box flex="1">
                      <Text fontSize="sm" mb={1}>종료</Text>
                      <Input type="datetime-local" value={eend} onChange={(e) => setEEnd(e.target.value)} readOnly={!edit} />
                    </Box>
                  </HStack>
                  <HStack justify="space-between">
                    <Button variant="outline" colorScheme="red" onClick={onDelete}>삭제</Button>
                    <HStack>
                      {!edit && (
                        <Button variant="ghost" onClick={() => setEdit(true)}>수정</Button>
                      )}
                      {edit && (
                        <Button bg="black" color="white" _hover={{ bg: "gray.800" }} onClick={onUpdate}>저장</Button>
                      )}
                      <Button variant="ghost" onClick={() => { setDetailOpen(false); setSelected(null); setEdit(false); }}>닫기</Button>
                    </HStack>
                  </HStack>
                </VStack>
              </Box>
            </Box>
          </Portal>
        )}
      </Box>
    </RequireAuth>
  );
}