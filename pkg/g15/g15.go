package g15

import (
	"io"
	"regexp"
	"strconv"
	"strings"

	"github.com/leighmacdonald/steamid/v3/steamid"
	"github.com/pkg/errors"
)

const maxDataSize = 102

type DumpPlayer struct {
	Names     [maxDataSize]string
	Ping      [maxDataSize]int
	Score     [maxDataSize]int
	Deaths    [maxDataSize]int
	Connected [maxDataSize]bool
	Team      [maxDataSize]int
	Alive     [maxDataSize]bool
	Health    [maxDataSize]int
	SteamID   [maxDataSize]steamid.SID64
	Valid     [maxDataSize]bool
	UserID    [maxDataSize]int
}

type Parser struct {
	rx *regexp.Regexp
}

func New() Parser {
	return Parser{
		rx: regexp.MustCompile(`^(m_szName|m_iPing|m_iScore|m_iDeaths|m_bConnected|m_iTeam|m_bAlive|m_iHealth|m_iAccountID|m_bValid|m_iUserID)\[(\d+)]\s(integer|bool|string)\s\((.+?)?\)$`),
	}
}

func (p Parser) Parse(reader io.Reader, data *DumpPlayer) error {
	body, errRead := io.ReadAll(reader)
	if errRead != nil {
		return errors.Wrap(errRead, "Failed to read dump data from reader")
	}

	intVal := func(s string, def int) int {
		index, errIndex := strconv.ParseInt(s, 10, 32)
		if errIndex != nil {
			return def
		}

		return int(index)
	}

	boolVal := func(s string) bool {
		val, errParse := strconv.ParseBool(s)
		if errParse != nil {
			return false
		}

		return val
	}

	for _, line := range strings.Split(string(body), "\n") {
		matches := p.rx.FindStringSubmatch(strings.Trim(line, "\r"))
		if len(matches) == 0 {
			continue
		}

		index := intVal(matches[2], -1)
		if index < 0 {
			continue
		}

		value := ""
		if len(matches) == 5 {
			value = matches[4]
		}

		switch matches[1] {
		case "m_szName":
			data.Names[index] = value
		case "m_iPing":
			data.Ping[index] = intVal(value, 0)
		case "m_iScore":
			data.Score[index] = intVal(value, 0)
		case "m_iDeaths":
			data.Deaths[index] = intVal(value, 0)
		case "m_bConnected":
			data.Connected[index] = boolVal(value)
		case "m_iTeam":
			data.Team[index] = intVal(value, 0)
		case "m_bAlive":
			data.Alive[index] = boolVal(value)
		case "m_iHealth":
			data.Health[index] = intVal(value, 0)
		case "m_iAccountID":
			data.SteamID[index] = steamid.SID32ToSID64(steamid.SID32(uint32(intVal(value, 0))))
		case "m_bValid":
			data.Valid[index] = boolVal(value)
		case "m_iUserID":
			data.UserID[index] = intVal(value, -1)
		}
	}

	return nil
}
